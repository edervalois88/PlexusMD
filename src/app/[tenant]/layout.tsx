import { Sidebar } from "@/components/Sidebar";
import { PageWrapper } from "@/components/PageWrapper";
import { getDataSource, OrganizationEntity } from "@/lib/data-source";
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
  const dataSource = await getDataSource();
  const organization = await dataSource.getRepository(OrganizationEntity).findOne({
    select: {
      id: true,
      is_active: true,
    },
    where: {
      slug: resolvedParams.tenant,
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
