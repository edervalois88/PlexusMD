import dayjs from "dayjs";
import { CalendarDays, Clock3, CreditCard, UserRound } from "lucide-react";

import { getDailyAppointmentsForTenant } from "@/actions/appointment";
import { prisma } from "@/lib/prisma";

import { AppointmentForm } from "./AppointmentForm";

type PageProps = {
  params: Promise<{ tenant: string }>;
};

type AppointmentRow = {
  id: string;
  start_time: Date;
  status: string;
  payment_status: string;
  patient_id: string;
  doctor_id: string;
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export default async function AgendaPage({ params }: PageProps) {
  const { tenant } = await params;
  const organization = await prisma.organization.findUnique({
    where: {
      slug: tenant,
    },
    select: {
      id: true,
      name: true,
      patients: {
        orderBy: {
          full_name: "asc",
        },
        take: 80,
        select: {
          id: true,
          full_name: true,
        },
      },
      users: {
        orderBy: {
          email: "asc",
        },
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!organization) {
    return null;
  }

  const appointments = (await getDailyAppointmentsForTenant(tenant, new Date())) as AppointmentRow[];
  const patientById = new Map(organization.patients.map((patient) => [patient.id, patient.full_name]));
  const doctorById = new Map(organization.users.map((doctor) => [doctor.id, doctor.email]));

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-6 p-6 xl:grid-cols-[360px_1fr]">
      <aside className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Agenda</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">{organization.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{dayjs().format("DD MMMM YYYY")}</p>
        </div>

        <AppointmentForm
          tenant={tenant}
          patients={organization.patients.map((patient) => ({ id: patient.id, fullName: patient.full_name }))}
          doctors={organization.users}
        />
      </aside>

      <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Citas reales de hoy</h2>
              <p className="text-sm text-slate-500">Postgres + Google Calendar + WhatsApp + Auditoria</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {appointments.length} citas
          </span>
        </div>

        <div className="space-y-3">
          {appointments.map((appointment) => (
            <article key={appointment.id} className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[90px_1fr_auto]">
              <div className="flex items-center gap-2 font-bold text-slate-950">
                <Clock3 size={16} className="text-teal-700" />
                {formatTime(appointment.start_time)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <UserRound size={16} className="text-slate-400" />
                  <p className="font-semibold text-slate-950">{patientById.get(appointment.patient_id) ?? `Paciente ${appointment.patient_id.slice(0, 8)}`}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{doctorById.get(appointment.doctor_id) ?? "Medico asignado"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{appointment.status}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                  <CreditCard size={12} />
                  {appointment.payment_status}
                </span>
              </div>
            </article>
          ))}

          {appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
              No hay citas reales para hoy.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
