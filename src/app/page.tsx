import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/auth";
import { AnimatedLanding } from "@/components/landing/AnimatedLanding";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.tenantSlug) {
    redirect("/dashboard");
  }

  return <AnimatedLanding />;
}
