import { type DefaultSession } from "next-auth";
import { type JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      organizationId: string;
      tenantSlug: string;
      role: string;
    };
  }

  interface User {
    organization_id?: string | null;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    organizationId?: string;
    tenantSlug?: string;
    role?: string;
  }
}
