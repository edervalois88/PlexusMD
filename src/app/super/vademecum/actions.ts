"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

export type VademecumActionState = {
  error?: string;
  success?: string;
};

const medicationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ingresa el nombre del medicamento."),
  commonDose: z.string().trim().min(3, "Ingresa una dosis de referencia."),
  warnings: z.string().trim().optional(),
  legalNotes: z.string().trim().optional(),
});

const parseWarnings = (rawWarnings?: string) =>
  (rawWarnings ?? "")
    .split("\n")
    .map((warning) => warning.trim())
    .filter(Boolean);

export async function upsertMedication(
  _prevState: VademecumActionState,
  formData: FormData,
): Promise<VademecumActionState> {
  try {
    await requireSuperAdmin();

    const parsed = medicationSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      commonDose: formData.get("commonDose"),
      warnings: formData.get("warnings"),
      legalNotes: formData.get("legalNotes"),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Revisa el medicamento.",
      };
    }

    const warnings = parseWarnings(parsed.data.warnings) as Prisma.InputJsonValue;

    if (parsed.data.id) {
      const medication = await prisma.medication.update({
        where: {
          id: parsed.data.id,
        },
        data: {
          name: parsed.data.name,
          common_dose: parsed.data.commonDose,
          warnings,
          legal_notes: parsed.data.legalNotes || null,
        },
      });

      await createAuditLog({
        action: "medication.updated",
        resource: "Medication",
        payload: {
          medicationId: medication.id,
          name: medication.name,
        },
      });
    } else {
      const medication = await prisma.medication.create({
        data: {
          name: parsed.data.name,
          common_dose: parsed.data.commonDose,
          warnings,
          legal_notes: parsed.data.legalNotes || null,
        },
      });

      await createAuditLog({
        action: "medication.created",
        resource: "Medication",
        payload: {
          medicationId: medication.id,
          name: medication.name,
        },
      });
    }

    revalidatePath("/super/vademecum");

    return {
      success: parsed.data.id ? "Medicamento actualizado." : "Medicamento creado.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        error: "Ya existe un medicamento con ese nombre.",
      };
    }

    return {
      error: error instanceof Error ? error.message : "No se pudo guardar el medicamento.",
    };
  }
}

export async function deleteMedication(formData: FormData) {
  await requireSuperAdmin();

  const id = z.string().uuid().parse(formData.get("id"));

  await prisma.medication.delete({
    where: {
      id,
    },
  });

  await createAuditLog({
    action: "medication.deleted",
    resource: "Medication",
    payload: {
      medicationId: id,
    },
  });

  revalidatePath("/super/vademecum");
}
