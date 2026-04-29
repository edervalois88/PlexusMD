import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowRight, LogIn, ShieldCheck, Sparkles } from "lucide-react";

import { authOptions } from "@/auth";

export const dynamic = "force-dynamic";

const getRootDomain = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN ?? "plexusmd.xyz";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.tenantSlug) {
    redirect(`https://${session.user.tenantSlug}.${getRootDomain()}/dashboard`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F8F7] text-[#1E293B]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm">
            <ShieldCheck size={16} />
            Portal seguro para clinicas SiAIstems
          </div>

          <h1 className="max-w-3xl text-5xl font-black text-slate-950 md:text-7xl">
            SiAIstems para inteligencia clinica operativa.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Accede a PlexusMD, administra tu tenant y activa flujos de consulta, agenda, Side Doctor y reportes de valor desde un solo portal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-6 py-3 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <LogIn size={18} />
              Iniciar Sesion
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Registrar Clinica
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-950">PlexusMD</p>
              <p className="text-sm text-slate-500">Entrada real al sistema de autenticacion</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            {[
              "Login con Google y mapeo automatico a tenant",
              "Subdominio clinico aislado por organizacion",
              "Agenda, auditoria y reportes de valor con trazabilidad",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700"
          >
            Abrir dashboard demo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
