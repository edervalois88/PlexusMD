import NextAuth, { type NextAuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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
      throw new Error("Email address is required.");
    }

    const organization = await resolveOrganizationForEmail(user.email);

    if (!organization) {
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
    CredentialsProvider({
      name: "Prueba Directa",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@plexusmd.xyz" },
        password: { label: "Password", type: "password", placeholder: "Cualquier contraseña" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Buscamos si el usuario ya existe
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true }
        });

        // Si no existe, creamos un usuario de prueba rápido vinculado a la primera organización
        if (!user) {
          const org = await getDefaultOrganization();
          if (!org) throw new Error("No hay organizaciones configuradas en la base de datos.");

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
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        // @ts-ignore
        token.userId = user.id;
        // @ts-ignore
        token.organizationId = user.organizationId;
        // @ts-ignore
        token.tenantSlug = user.tenantSlug;
        // @ts-ignore
        token.role = user.role;
      }

      const email = user?.email ?? token.email;
      const shouldRefresh = trigger === "signIn" || trigger === "signUp" || !token.organizationId || !token.tenantSlug;

      if (!email && !token.sub) {
        return token;
      }

      if (shouldRefresh && !user) {
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
