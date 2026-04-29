import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { jwtVerify } from "jose";

import { getDataSource, OrganizationEntity } from "@/lib/data-source";

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

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() || "127.0.0.1" : "127.0.0.1";
};

const getTenantSlug = (hostname: string) => {
  const rootDomain = process.env.ROOT_DOMAIN ?? "tu-dominio.com";
  const localHostSuffix = ".localhost:3000";

  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    return hostname.endsWith(`.${rootDomain}`) ? hostname.replace(`.${rootDomain}`, "") : "";
  }

  return hostname.endsWith(localHostSuffix) ? hostname.replace(localHostSuffix, "") : "";
};

const isTenantActive = async (tenantSlug: string) => {
  const cacheKey = `tenant:${tenantSlug}:is_active`;

  try {
    const cached = await kv.get<boolean>(cacheKey);
    if (typeof cached === "boolean") {
      return cached;
    }
  } catch (error) {
    console.warn("Tenant activation cache read failed, falling back to Postgres.", error);
  }

  const dataSource = await getDataSource();
  const organization = await dataSource.getRepository(OrganizationEntity).findOne({
    select: {
      id: true,
      is_active: true,
    },
    where: {
      slug: tenantSlug,
    },
  });

  const active = organization?.is_active === true;

  try {
    await kv.set(cacheKey, active, { ex: TENANT_CACHE_TTL_SECONDS });
  } catch (error) {
    console.warn("Tenant activation cache write failed.", error);
  }

  return active;
};

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

  const tenantSlug = getTenantSlug(hostname);

  if (tenantSlug && tenantSlug !== "www") {
    const active = await isTenantActive(tenantSlug);

    if (!active) {
      return new NextResponse("Tenant inactive or not found", { status: 404 });
    }

    const token = request.cookies.get("auth_token")?.value;

    if (url.pathname.startsWith("/api") || url.pathname !== "/") {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      try {
        await jwtVerify(token, JWT_SECRET);
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    if (url.pathname.includes("/actions/ai")) {
      const { success } = await aiTenantRatelimit.limit(`ai_tenant_${tenantSlug}`);
      if (!success) return NextResponse.json({ error: "Limite IA excedido" }, { status: 429 });
    }

    url.pathname = `/${tenantSlug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
