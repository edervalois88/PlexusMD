import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Search, UserPlus, Users, ChevronRight } from "lucide-react";

import { authOptions } from "@/auth";
import { getPatientsByTenant } from "@/actions/patient";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Pacientes",
};

type PageProps = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string }>;
};

const calculateAge = (birthDate: Date | null) => {
  if (!birthDate) return "-";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

export default async function PatientsPage({ params, searchParams }: PageProps) {
  const [{ tenant }, { q: query }, session] = await Promise.all([
    params,
    searchParams,
    getServerSession(authOptions),
  ]);

  if (!session?.user || session.user.tenantSlug !== tenant) {
    redirect("/");
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: tenant },
    select: { name: true },
  });

  if (!organization) redirect("/");

  const allPatients = await getPatientsByTenant(tenant);
  const filteredPatients = query
    ? allPatients.filter((p) =>
        p.full_name.toLowerCase().includes(query.toLowerCase()) ||
        p.curp?.toLowerCase().includes(query.toLowerCase())
      )
    : allPatients;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Gestión de Pacientes</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{organization.name}</h1>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14B8A6] px-5 text-sm font-semibold text-white transition hover:bg-[#119e8f]">
          <UserPlus size={18} />
          Nuevo Paciente
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <form>
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre o CURP..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
          />
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPatients.map((patient) => (
          <Link
            key={patient.id}
            href={`/${tenant}/pacientes/${patient.id}`}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                {patient.full_name.charAt(0)}
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-teal-400 transition-colors" size={20} />
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                {patient.full_name}
              </h3>
              <p className="text-xs font-medium text-slate-500 uppercase mt-1">
                {patient.curp || "Sin CURP"}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-slate-50 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Edad</p>
                <p className="text-sm font-semibold text-slate-700">{calculateAge(patient.birth_date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actualizado</p>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(patient.updatedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {filteredPatients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No se encontraron pacientes</h3>
            <p className="mt-1 text-sm text-slate-500">Intenta con otro término de búsqueda o crea uno nuevo.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
