import NextAuth, { type NextAuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "super-secret-key-change-in-prod";

const getDefaultOrganization = async () => {
  if (process.env.DEFAULT_TENANT_SLUG) {
    const organization = await prisma.organization.findUnique({
      where: {
        slug: process.env.DEFAULT_TENANT_SLUG,
      },
    });

    if (organization?.is_active) {
      return organization;
    }
  }

  return prisma.organization.findFirst({
    where: {
      is_active: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

const resolveOrganizationForEmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      organization: true,
    },
  });

  if (existingUser?.organization) {
    return existingUser.organization;
  }

  return await getDefaultOrganization();
};

const baseAdapter = PrismaAdapter(prisma);

const adapter = {
  ...baseAdapter,
  async createUser(user: AdapterUser) {
    if (!user.email) {
      throw new Error("Google login requires an email address.");
    }

    const organization = await resolveOrganizationForEmail(user.email);

    if (!organization) {
      // En NextAuth, las excepciones en el adapter suelen lanzar un error.
      // Para redirigir, lo ideal es capturar este estado en el signIn callback.
      throw new Error("UNREGISTERED_EMAIL");
    }

    const role = process.env.SUPER_ADMIN_EMAIL?.toLowerCase() === user.email.toLowerCase() ? "SUPERADMIN" : "DOCTOR";

    return prisma.user.create({
      data: {
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified ? new Date(user.emailVerified as Date | string) : null,
        organization_id: organization.id,
        role,
      },
    });
  },
};

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // La validación ocurre en el adapter createUser.
        // Si todo está bien, devuelve true.
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      const email = user?.email ?? token.email;
      const shouldRefresh = trigger === "signIn" || trigger === "signUp" || !token.organizationId || !token.tenantSlug;

      if (!email && !token.sub) {
        return token;
      }

      if (shouldRefresh) {
        const dbUser = await prisma.user.findFirst({
          where: email
            ? { email }
            : token.sub
              ? { id: token.sub }
              : undefined,
          include: {
            organization: true,
          },
        });

        if (dbUser?.organization) {
          token.userId = dbUser.id;
          token.organizationId = dbUser.organization_id;
          token.tenantSlug = dbUser.organization.slug;
          token.role = dbUser.role;
          token.email = dbUser.email;
          token.name = dbUser.name ?? token.name;
          token.picture = dbUser.image ?? token.picture;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? token.sub ?? "";
        session.user.organizationId = (token.organizationId as string) ?? "";
        session.user.tenantSlug = (token.tenantSlug as string) ?? "";
        session.user.role = (token.role as string) ?? "DOCTOR";
      }

      return session;
    },
  },
};

const authHandler = NextAuth(authOptions);

export { authHandler };
