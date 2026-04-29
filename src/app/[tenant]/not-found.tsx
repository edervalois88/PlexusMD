import Link from "next/link";
import { Building2, Home, LifeBuoy } from "lucide-react";

export default function TenantNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8F7] px-6 text-[#1E293B]">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Building2 size={30} />
        </div>
        <h1 className="text-3xl font-black text-slate-950">Clinica no disponible</h1>
        <p className="mt-4 text-slate-600">
          No encontramos una organizacion activa para este tenant. Puede estar suspendida, no existir o tener un slug incorrecto.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <Home size={18} />
            Ver clinicas demo
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LifeBuoy size={18} />
            Registrar tenant
          </Link>
        </div>
      </div>
    </div>
  );
}
