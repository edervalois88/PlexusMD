import { redirect } from "next/navigation";
import { Activity, Building2, Filter } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

export const metadata = {
  title: "Audit Logs",
};

type PageProps = {
  searchParams: Promise<{
    organizationId?: string;
    action?: string;
  }>;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export default async function SuperAuditLogsPage({ searchParams }: PageProps) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/");
  }

  const filters = await searchParams;
  const organizationId = filters.organizationId || "";
  const action = filters.action || "";

  const [organizations, actionRows, logs] = await Promise.all([
    prisma.organization.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    prisma.auditLog.findMany({
      distinct: ["action"],
      orderBy: {
        action: "asc",
      },
      select: {
        action: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(action ? { action } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 150,
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 text-[#1E293B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Super-Admin</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Audit Logs</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Rastreo global de cambios por usuario, clinica, accion y recurso.
          </p>
        </div>

        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2"><Building2 size={16} /> Clinica</span>
            <select name="organizationId" defaultValue={organizationId} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400">
              <option value="">Todas</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name} ({organization.slug})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2"><Activity size={16} /> Accion</span>
            <select name="action" defaultValue={action} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400">
              <option value="">Todas</option>
              {actionRows.map((row) => (
                <option key={row.action} value={row.action}>
                  {row.action}
                </option>
              ))}
            </select>
          </label>

          <button className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-5 text-sm font-semibold text-white hover:bg-slate-900">
            <Filter size={16} />
            Filtrar
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Clinica</th>
                <th className="p-4 font-semibold">Usuario</th>
                <th className="p-4 font-semibold">Accion</th>
                <th className="p-4 font-semibold">Recurso</th>
                <th className="p-4 font-semibold">IP</th>
                <th className="p-4 font-semibold">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="align-top">
                  <td className="p-4 text-slate-500">{formatDate(log.createdAt)}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{log.organization?.name ?? "Global"}</p>
                    <p className="text-xs text-slate-500">{log.organization?.slug ?? "-"}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{log.user?.email ?? "Sistema"}</p>
                    <p className="text-xs text-slate-500">{log.user?.role ?? "-"}</p>
                  </td>
                  <td className="p-4"><ActionBadge action={log.action} /></td>
                  <td className="p-4 text-slate-700">{log.resource}</td>
                  <td className="p-4 text-slate-500">{log.ip ?? "-"}</td>
                  <td className="max-w-md p-4">
                    <pre className="max-h-28 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                      {JSON.stringify(log.payload ?? {}, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No hay movimientos para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
      {action}
    </span>
  );
}
