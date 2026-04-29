import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { RegistrationForm } from "./RegistrationForm";

export const metadata = {
  title: "Registro",
};

export default function RegistroPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F4F8F7] text-[#1E293B]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,_rgba(20,184,166,0.24),_transparent_30%),radial-gradient(circle_at_80%_0%,_rgba(30,41,59,0.18),_transparent_28%),linear-gradient(135deg,_#F9FAFB_0%,_#E8F4F2_48%,_#F7F1E7_100%)]" />

      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            <ArrowLeft size={16} />
            Volver a demos
          </Link>

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Onboarding PlexusMD</p>
          <h1 className="max-w-2xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
            Tu tenant clinico en menos de un minuto.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Creamos la organizacion, el usuario medico inicial y redirigimos al subdominio operativo.
          </p>

          <div className="mt-8 space-y-3 text-sm font-medium text-slate-700">
            {["Aislamiento manual por organization_id", "Tenant activo por defecto", "Dashboard listo para demo"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="text-teal-600" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <RegistrationForm />
      </section>
    </main>
  );
}
