import type { NextAuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { basePrisma as prisma } from "./prisma-instance";

const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "super-secret-key-change-in-prod";

const getDefaultOrganization = async () => {
  if (process.env.DEFAULT_TENANT_SLUG) {
    const organization = await prisma.organization.findUnique({
      where: { slug: process.env.DEFAULT_TENANT_SLUG },
    });
    if (organization?.is_active) return organization;
  }
  return prisma.organization.findFirst({
    where: { is_active: true },
    orderBy: { createdAt: "asc" },
  });
};

const resolveOrganizationForEmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });
  if (existingUser?.organization) return existingUser.organization;
  return await getDefaultOrganization();
};

const baseAdapter = PrismaAdapter(prisma as any);

const adapter = {
  ...baseAdapter,
  async createUser(user: AdapterUser) {
    if (!user.email) throw new Error("Email address is required.");
    const organization = await resolveOrganizationForEmail(user.email);
    if (!organization) throw new Error("UNREGISTERED_EMAIL");
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
  adapter: adapter as any,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Prueba Directa",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true }
        });
        if (!user) {
          const org = await getDefaultOrganization();
          if (!org) throw new Error("No hay organizaciones configuradas.");
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: "Usuario de Prueba",
              organization_id: org.id,
              role: "SUPERADMIN"
            },
            include: { organization: true }
          });
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organization_id,
          tenantSlug: user.organization?.slug
        };
      }
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = (user as any).id;
        token.organizationId = (user as any).organizationId;
        token.tenantSlug = (user as any).tenantSlug;
        token.role = (user as any).role;
      }
      const email = user?.email ?? token.email;
      if (!email && !token.sub) return token;
      const shouldRefresh = trigger === "signIn" || trigger === "signUp" || !token.organizationId;
      if (shouldRefresh && !user) {
        const dbUser = await prisma.user.findFirst({
          where: email ? { email } : { id: token.sub as string },
          include: { organization: true },
        });
        if (dbUser?.organization) {
          token.userId = dbUser.id;
          token.organizationId = dbUser.organization_id;
          token.tenantSlug = dbUser.organization.slug;
          token.role = dbUser.role;
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
