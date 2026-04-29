"use client";

import { useActionState, useState } from "react";
import { CalendarPlus } from "lucide-react";

import { createAppointmentForTenant, type AppointmentActionState } from "@/actions/appointment";

type PatientOption = {
  id: string;
  fullName: string;
};

type DoctorOption = {
  id: string;
  email: string;
};

const initialState: AppointmentActionState = {};

export function AppointmentForm({
  tenant,
  patients,
  doctors,
}: {
  tenant: string;
  patients: PatientOption[];
  doctors: DoctorOption[];
}) {
  const [state, formAction, isPending] = useActionState(createAppointmentForTenant, initialState);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  });

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="tenant" value={tenant} />
      <input type="hidden" name="startTime" value={new Date(selectedDateTime).toISOString()} />

      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <CalendarPlus size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-950">Nueva Cita</h2>
          <p className="text-sm text-slate-500">Valida Google Calendar, guarda en DB y confirma por WhatsApp.</p>
        </div>
      </div>

      <label className="block space-y-1 text-sm font-medium text-slate-700">
        <span>Paciente</span>
        <select name="patientId" required className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400">
          <option value="">Selecciona paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1 text-sm font-medium text-slate-700">
        <span>Medico</span>
        <select name="doctorId" className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400">
          <option value="">Usuario actual</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.email}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1 text-sm font-medium text-slate-700">
        <span>Fecha y hora</span>
        <input
          type="datetime-local"
          value={selectedDateTime}
          onChange={(event) => setSelectedDateTime(event.target.value)}
          required
          className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400"
        />
      </label>

      <label className="block space-y-1 text-sm font-medium text-slate-700">
        <span>WhatsApp del paciente</span>
        <input
          name="patientPhone"
          type="tel"
          placeholder="5215512345678"
          className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400"
        />
      </label>

      {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl bg-[#14B8A6] text-sm font-semibold text-white transition hover:bg-[#119e8f] disabled:opacity-60"
      >
        {isPending ? "Sincronizando..." : "Crear y sincronizar cita"}
      </button>
    </form>
  );
}
