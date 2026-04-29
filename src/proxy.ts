import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";

import { getDataSource, OrganizationEntity } from "@/lib/data-source";
import { UserEntity } from "@/lib/data-source";

const TENANT_CACHE_TTL_SECONDS = 60;

const globalRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});

const aiTenantRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-in-prod");
const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "super-secret-key-change-in-prod";
const VERCEL_APP_DOMAIN = "vercel.app";

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() || "127.0.0.1" : "127.0.0.1";
};

const normalizeHostname = (hostname: string) => hostname.split(":")[0]?.toLowerCase() ?? "";

const isVercelHostname = (hostname: string) => hostname === VERCEL_APP_DOMAIN || hostname.endsWith(`.${VERCEL_APP_DOMAIN}`);

const isSuperAdminPayload = (payload: { role?: unknown; email?: unknown }) => {
  const role = typeof payload.role === "string" ? payload.role.toUpperCase() : "";
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
  const allowedEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();

  return role === "SUPERADMIN" || role === "SUPER_ADMIN" || Boolean(allowedEmail && email === allowedEmail);
};

type RequestAuthContext = {
  role?: string;
  email?: string;
  organizationId?: string;
  tenantSlug?: string;
};

const buildRootLoginUrl = (request: NextRequest) => {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN;

  if (rootDomain) {
    return `https://${rootDomain}/login`;
  }

  return new URL("/login", request.url).toString();
};

const resolveLegacyAuthContext = async (request: NextRequest): Promise<RequestAuthContext | null> => {
  const legacyToken = request.cookies.get("auth_token")?.value;

  if (!legacyToken) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(legacyToken, JWT_SECRET);
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    const role = typeof payload.role === "string" ? payload.role : undefined;

    if (!email) {
      return { role, email: undefined };
    }

    const dataSource = await getDataSource();
    const user = await dataSource.getRepository(UserEntity).findOne({
      where: {
        email,
      },
      relations: {
        organization: true,
      },
    });

    if (!user?.organization) {
      return { role, email };
    }

    return {
      role: user.role ?? role,
      email,
      organizationId: user.organization_id,
      tenantSlug: user.organization.slug,
    };
  } catch {
    return null;
  }
};

const resolveAuthContext = async (request: NextRequest): Promise<RequestAuthContext | null> => {
  const token = await getToken({ req: request, secret: AUTH_SECRET });

  if (token) {
    return {
      role: typeof token.role === "string" ? token.role : undefined,
      email: typeof token.email === "string" ? token.email : undefined,
      organizationId: typeof token.organizationId === "string" ? token.organizationId : undefined,
      tenantSlug: typeof token.tenantSlug === "string" ? token.tenantSlug : undefined,
    };
  }

  return await resolveLegacyAuthContext(request);
};

const getTenantSlug = (hostname: string) => {
  const normalizedHost = normalizeHostname(hostname);
  const rootDomain = process.env.ROOT_DOMAIN ?? "tu-dominio.com";
  const localHostSuffix = ".localhost:3000";

  if (isVercelHostname(normalizedHost)) {
    return "";
  }

  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    if (normalizedHost === rootDomain || normalizedHost === `www.${rootDomain}`) {
      return "";
    }

    return normalizedHost.endsWith(`.${rootDomain}`) ? normalizedHost.replace(`.${rootDomain}`, "") : "";
  }

  return hostname.endsWith(localHostSuffix) ? hostname.replace(localHostSuffix, "") : "";
};

const getOrganizationStatus = async (tenantSlug: string) => {
  const cacheKey = `tenant:${tenantSlug}:status`;

  try {
    const cached = await kv.get<{ slug: string; isActive: boolean }>(cacheKey);
    if (cached && typeof cached.isActive === "boolean") {
      return cached;
    }
  } catch (error) {
    console.warn("Tenant activation cache read failed, falling back to Postgres.", error);
  }

  const dataSource = await getDataSource();
  const organization = await dataSource.getRepository(OrganizationEntity).findOne({
    select: {
      id: true,
      slug: true,
      is_active: true,
    },
    where: {
      slug: tenantSlug,
    },
  });

  const status = {
    slug: tenantSlug,
    isActive: organization?.is_active === true,
  };

  try {
    await kv.set(cacheKey, status, { ex: TENANT_CACHE_TTL_SECONDS });
  } catch (error) {
    console.warn("Tenant activation cache write failed.", error);
  }

  return status;
};

const getDefaultTenantSlug = async () => {
  const configuredSlug = process.env.DEFAULT_TENANT_SLUG;

  if (configuredSlug) {
    const status = await getOrganizationStatus(configuredSlug);
    if (status.isActive) {
      return configuredSlug;
    }
  }

  const cacheKey = "tenant:default-active";

  try {
    const cached = await kv.get<string>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn("Default tenant cache read failed, falling back to Postgres.", error);
  }

  const dataSource = await getDataSource();
  const organization = await dataSource.getRepository(OrganizationEntity).findOne({
    select: {
      slug: true,
    },
    where: {
      is_active: true,
    },
    order: {
      createdAt: "ASC",
    },
  });

  if (!organization) {
    return "";
  }

  try {
    await kv.set(cacheKey, organization.slug, { ex: TENANT_CACHE_TTL_SECONDS });
  } catch (error) {
    console.warn("Default tenant cache write failed.", error);
  }

  return organization.slug;
};

const shouldUseDefaultTenant = (hostname: string) => {
  const normalizedHost = normalizeHostname(hostname);
  const rootDomain = process.env.ROOT_DOMAIN ?? "tu-dominio.com";

  return (
    isVercelHostname(normalizedHost) ||
    normalizedHost === rootDomain ||
    normalizedHost === `www.${rootDomain}` ||
    normalizedHost === "localhost"
  );
};

const isPublicRootPath = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/login") ||
  pathname.startsWith("/registro") ||
  pathname.startsWith("/api/auth") ||
  pathname.startsWith("/auth/callback") ||
  pathname.startsWith("/debug/health") ||
  pathname === "/icon.svg";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const ip = getClientIp(request);

  try {
    const { success } = await globalRatelimit.limit(`global_${ip}`);
    if (!success) return new NextResponse("Too Many Requests", { status: 429 });
  } catch (error) {
    console.warn("Ratelimit failed, continuing request.", error);
  }

  if (url.pathname.startsWith("/_next") || url.pathname.startsWith("/static") || url.pathname.includes(".")) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/super")) {
    const authContext = await resolveAuthContext(request);

    if (!authContext) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isSuperAdminPayload(authContext)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const tenantSlug = getTenantSlug(hostname);

  if (!tenantSlug && isPublicRootPath(url.pathname)) {
    return NextResponse.next();
  }

  if (tenantSlug && tenantSlug !== "www") {
    const status = await getOrganizationStatus(tenantSlug);

    if (!status.isActive) {
      url.pathname = `/${tenantSlug}/dashboard`;
      return NextResponse.rewrite(url);
    }

    const authContext = await resolveAuthContext(request);

    if (!authContext?.tenantSlug) {
      return NextResponse.redirect(new URL(buildRootLoginUrl(request)));
    }

    if (authContext.tenantSlug !== tenantSlug) {
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN;
      const target = rootDomain ? `https://${authContext.tenantSlug}.${rootDomain}/dashboard` : `/${authContext.tenantSlug}/dashboard`;
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (url.pathname.includes("/actions/ai")) {
      const { success } = await aiTenantRatelimit.limit(`ai_tenant_${tenantSlug}`);
      if (!success) return NextResponse.json({ error: "Limite IA excedido" }, { status: 429 });
    }

    url.pathname = `/${tenantSlug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (shouldUseDefaultTenant(hostname) && url.pathname === "/dashboard") {
    const defaultTenantSlug = await getDefaultTenantSlug();

    if (defaultTenantSlug) {
      url.pathname = `/${defaultTenantSlug}/dashboard`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
