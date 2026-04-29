import { Sidebar } from "@/components/Sidebar";
import { PageWrapper } from "@/components/PageWrapper";
import { ReactNode } from "react";

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar tenant={resolvedParams.tenant} />
      <main className="flex-1 ml-64 min-h-screen p-8">
        <PageWrapper>{children}</PageWrapper>
      </main>
    </div>
  );
}
