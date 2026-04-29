import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";

import { getDataSource, OrganizationEntity } from "@/lib/data-source";

export const dynamic = "force-dynamic";

const getDemoOrganizations = async () => {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(OrganizationEntity);

  return await repo.find({
    select: {
      id: true,
      name: true,
      slug: true,
      is_active: true,
    },
    where: {
      is_active: true,
    },
    order: {
      createdAt: "ASC",
    },
    take: 6,
  });
};

export default async function Home() {
  const organizations = await getDemoOrganizations();
  const defaultOrganization = organizations[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F4F8F7] text-[#1E293B]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_34%),linear-gradient(135deg,_#F9FAFB_0%,_#E8F4F2_48%,_#F7F1E7_100%)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-4 py-2 text-sm font-medium text-teal-800 shadow-sm backdrop-blur">
          <ShieldCheck size={16} />
          MVP conectado a Vercel Postgres
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-900 md:text-7xl">
              PlexusMD listo para demo clínica.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Selecciona una clínica activa del seed o entra directo al dashboard de la organización por defecto.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {defaultOrganization ? (
                <Link
                  href={`/${defaultOrganization.slug}/dashboard`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-6 py-3 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Abrir dashboard demo
                  <ArrowRight size={18} />
                </Link>
              ) : null}
              <Link
                href="/debug/health"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 font-semibold text-slate-700 transition hover:bg-white"
              >
                Ver health check
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="mb-5 flex items-center gap-2 text-sm text-teal-200">
                <Building2 size={16} />
                Clínicas Demo
              </div>

              <div className="space-y-3">
                {organizations.length > 0 ? (
                  organizations.map((organization) => (
                    <Link
                      key={organization.id}
                      href={`/${organization.slug}/dashboard`}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-300/50 hover:bg-teal-300/10"
                    >
                      <div>
                        <p className="font-semibold">{organization.name}</p>
                        <p className="text-sm text-slate-400">{organization.slug}</p>
                      </div>
                      <ArrowRight className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-200" size={18} />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
                    No hay clínicas activas. Ejecuta <span className="font-mono">npm run db:seed</span>.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
