import { redirect } from "next/navigation";
import { BrainCircuit, CalendarDays, Cpu, UsersRound, Zap } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

export const metadata = {
  title: "Consumo de Recursos",
};

const getEstimatedTokens = (payload: Prisma.JsonValue) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return 0;
  }

  const tokenUsage = (payload as Record<string, unknown>).tokenUsage;

  if (!tokenUsage || typeof tokenUsage !== "object" || Array.isArray(tokenUsage)) {
    return 0;
  }

  const usage = tokenUsage as Record<string, unknown>;
  const totalTokens = usage.totalTokens;
  const estimatedResponseTokens = usage.estimatedResponseTokens;

  if (typeof totalTokens === "number") {
    return totalTokens;
  }

  return typeof estimatedResponseTokens === "number" ? estimatedResponseTokens : 0;
};

export default async function SuperMetricsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/");
  }

  const [organizations, aiAuditLogs] = await Promise.all([
    prisma.organization.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        _count: {
          select: {
            patients: true,
            appointments: true,
          },
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        action: {
          startsWith: "ai.",
        },
      },
      select: {
        organizationId: true,
        payload: true,
      },
    }),
  ]);

  const aiTelemetryByOrganization = aiAuditLogs.reduce(
    (acc, log) => {
      const key = log.organizationId ?? "global";
      const current = acc.get(key) ?? { calls: 0, tokens: 0 };
      current.calls += 1;
      current.tokens += getEstimatedTokens(log.payload);
      acc.set(key, current);
      return acc;
    },
    new Map<string, { calls: number; tokens: number }>(),
  );

  const totals = organizations.reduce(
    (acc, organization) => ({
      patients: acc.patients + organization._count.patients,
      appointments: acc.appointments + organization._count.appointments,
      aiCalls: acc.aiCalls + organization.ai_usage_count,
      aiAuditEvents: acc.aiAuditEvents + (aiTelemetryByOrganization.get(organization.id)?.calls ?? 0),
      aiTokens: acc.aiTokens + (aiTelemetryByOrganization.get(organization.id)?.tokens ?? 0),
    }),
    { patients: 0, appointments: 0, aiCalls: 0, aiAuditEvents: 0, aiTokens: 0 },
  );

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 text-[#1E293B]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Super-Admin</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Consumo de Recursos</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Vista agregada de pacientes, citas y llamadas Gemini por organizacion.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard icon={<UsersRound />} label="Pacientes" value={totals.patients} />
          <MetricCard icon={<CalendarDays />} label="Citas" value={totals.appointments} />
          <MetricCard icon={<Zap />} label="Llamadas Gemini" value={totals.aiCalls} />
          <MetricCard icon={<BrainCircuit />} label="Eventos IA auditados" value={totals.aiAuditEvents} />
          <MetricCard icon={<Cpu />} label="Tokens IA estimados" value={totals.aiTokens} />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Organizacion</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Pacientes</th>
                <th className="p-4 font-semibold">Citas</th>
                <th className="p-4 font-semibold">Gemini API</th>
                <th className="p-4 font-semibold">Audit IA</th>
                <th className="p-4 font-semibold">Tokens</th>
                <th className="p-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((organization) => {
                const aiTelemetry = aiTelemetryByOrganization.get(organization.id) ?? { calls: 0, tokens: 0 };

                return (
                  <tr key={organization.id}>
                    <td className="p-4 font-semibold text-slate-900">{organization.name}</td>
                    <td className="p-4 text-slate-500">{organization.slug}</td>
                    <td className="p-4">{organization._count.patients}</td>
                    <td className="p-4">{organization._count.appointments}</td>
                    <td className="p-4">{organization.ai_usage_count}</td>
                    <td className="p-4">{aiTelemetry.calls}</td>
                    <td className="p-4">{aiTelemetry.tokens.toLocaleString("es-MX")}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${organization.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {organization.is_active ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value.toLocaleString("es-MX")}</p>
    </div>
  );
}
