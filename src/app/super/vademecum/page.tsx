import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

import { deleteMedication } from "./actions";
import { MedicationForm } from "./MedicationForm";

export const metadata = {
  title: "Vademecum",
};

const stringifyWarnings = (warnings: unknown) => (Array.isArray(warnings) ? warnings.join("\n") : "");

export default async function VademecumPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/");
  }

  const medications = await prisma.medication.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 text-[#1E293B]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Super-Admin</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Vademécum Manager</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Administra medicamentos, dosis de referencia y notas legales para reducir alucinaciones en recetas.
          </p>
        </div>

        <MedicationForm />

        <div className="space-y-5">
          {medications.map((medication) => (
            <div key={medication.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto]">
              <MedicationForm
                medication={{
                  id: medication.id,
                  name: medication.name,
                  commonDose: medication.common_dose,
                  warnings: stringifyWarnings(medication.warnings),
                  legalNotes: medication.legal_notes ?? "",
                }}
              />
              <form action={deleteMedication} className="self-start">
                <input type="hidden" name="id" value={medication.id} />
                <Button type="submit" variant="destructive" className="h-10 rounded-xl">
                  <Trash2 />
                  Borrar
                </Button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
