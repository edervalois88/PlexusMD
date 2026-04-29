import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/auth";

const getRootDomain = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN ?? "plexusmd.xyz";

export default async function AuthCallbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantSlug) {
    redirect("/login");
  }

  redirect(`https://${session.user.tenantSlug}.${getRootDomain()}/dashboard`);
}
