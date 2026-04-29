import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { jwtVerify } from "jose";

import { authOptions } from "@/auth";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-in-prod");

type AuthPayload = {
  role?: string;
  email?: string;
};

const isSuperAdminPayload = (payload: AuthPayload) => {
  const role = payload.role?.toUpperCase();
  const allowedEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();

  return role === "SUPERADMIN" || role === "SUPER_ADMIN" || Boolean(allowedEmail && payload.email?.toLowerCase() === allowedEmail);
};

export const requireSuperAdmin = async () => {
  const session = await getServerSession(authOptions);

  if (session?.user?.role?.toUpperCase() === "SUPERADMIN" || session?.user?.role?.toUpperCase() === "SUPER_ADMIN") {
    return {
      role: session.user.role,
      email: session.user.email ?? undefined,
    };
  }

  const token = (await cookies()).get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const { payload } = await jwtVerify(token, JWT_SECRET);

  if (!isSuperAdminPayload(payload as AuthPayload)) {
    throw new Error("Forbidden");
  }

  return payload as AuthPayload;
};
