import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Activity, Filter } from "lucide-react";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Auditoria",
};

type PageProps = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{
    action?: string;
  }>;
};

const allowedRoles = new Set(["ADMIN", "SUPERADMIN", "SUPER_ADMIN"]);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export default async function TenantAuditPage({ params, searchParams }: PageProps) {
  const [{ tenant }, filters, session] = await Promise.all([
    params,
    searchParams,
    getServerSession(authOptions),
  ]);

  if (!session?.user || session.user.tenantSlug !== tenant || !allowedRoles.has(session.user.role.toUpperCase())) {
    redirect(`/${tenant}/dashboard`);
  }

  const organization = await prisma.organization.findUnique({
    where: {
      slug: tenant,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!organization) {
    redirect("/");
  }

  const action = filters.action || "";

  const [actionRows, logs] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        organizationId: organization.id,
      },
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
        organizationId: organization.id,
        ...(action ? { action } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Auditoria</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{organization.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Movimientos recientes del personal de la clinica.
        </p>
      </div>

      <form className="grid max-w-xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
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
              <th className="p-4 font-semibold">Usuario</th>
              <th className="p-4 font-semibold">Accion</th>
              <th className="p-4 font-semibold">Recurso</th>
              <th className="p-4 font-semibold">IP</th>
              <th className="p-4 font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="p-4 text-slate-500">{formatDate(log.createdAt)}</td>
                <td className="p-4">
                  <p className="font-medium text-slate-900">{log.user?.email ?? "Sistema"}</p>
                  <p className="text-xs text-slate-500">{log.user?.role ?? "-"}</p>
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-slate-700">{log.resource}</td>
                <td className="p-4 text-slate-500">{log.ip ?? "-"}</td>
                <td className="max-w-md p-4">
                  <pre className="max-h-24 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                    {JSON.stringify(log.payload ?? {}, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No hay movimientos para mostrar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
