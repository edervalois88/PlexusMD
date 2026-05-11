import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";

export async function getCurrentUserId() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
