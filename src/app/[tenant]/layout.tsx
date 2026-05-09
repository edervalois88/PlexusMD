import { Sidebar } from "@/components/Sidebar";
import { PageWrapper } from "@/components/PageWrapper";
import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";
import { notFound } from "next/navigation";

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const resolvedParams = await params;
  const organization = await prisma.organization.findUnique({
    where: {
      slug: resolvedParams.tenant,
    },
    select: {
      id: true,
      is_active: true,
    },
  });

  if (!organization?.is_active) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar tenant={resolvedParams.tenant} />
      <main className="flex-1 ml-64 min-h-screen p-8">
        <PageWrapper>{children}</PageWrapper>
      </main>
    </div>
  );
}
