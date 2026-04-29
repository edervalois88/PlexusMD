"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import { upsertMedication, type VademecumActionState } from "./actions";

type MedicationFormProps = {
  medication?: {
    id: string;
    name: string;
    commonDose: string;
    warnings: string;
    legalNotes: string;
  };
};

const initialState: VademecumActionState = {};

export function MedicationForm({ medication }: MedicationFormProps) {
  const [state, formAction, isPending] = useActionState(upsertMedication, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {medication?.id ? <input type="hidden" name="id" value={medication.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Medicamento</span>
          <input name="name" defaultValue={medication?.name} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Dosis de referencia</span>
          <input name="commonDose" defaultValue={medication?.commonDose} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
        </label>
      </div>

      <label className="mt-4 block space-y-1">
        <span className="text-sm font-semibold text-slate-700">Alertas y advertencias, una por linea</span>
        <textarea name="warnings" defaultValue={medication?.warnings} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
      </label>

      <label className="mt-4 block space-y-1">
        <span className="text-sm font-semibold text-slate-700">legal_notes</span>
        <textarea
          name="legalNotes"
          defaultValue={medication?.legalNotes}
          rows={3}
          placeholder="Ej. Verificar requisitos de receta conforme NOM-004 y normativa aplicable en México."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      {state.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{state.error}</p> : null}
      {state.success ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{state.success}</p> : null}

      <Button type="submit" className="mt-5 h-10 rounded-xl" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Save />}
        {medication ? "Actualizar" : "Crear medicamento"}
      </Button>
    </form>
  );
}
