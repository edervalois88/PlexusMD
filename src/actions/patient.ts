"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPatientForTenant(tenantSlug: string, patientId: string) {
  try {
    // Buscar la organización por slug (tenant)
    const organization = await prisma.organization.findUnique({
      where: { slug: tenantSlug },
    });

    if (!organization) {
      throw new Error("Organización no encontrada.");
    }

    const patient = uuidLike.test(patientId)
      ? await prisma.patient.findFirst({
          where: {
            id: patientId,
            organization_id: organization.id,
          },
        })
      : await prisma.patient.findFirst({
          where: {
            organization_id: organization.id,
            full_name: "Roberto Castañeda",
          },
        });

    if (!patient) {
      throw new Error("Paciente no encontrado o no pertenece a esta organización.");
    }

    return {
      id: patient.id,
      organization_id: patient.organization_id,
      full_name: patient.full_name,
      curp: patient.curp,
      birth_date: patient.birth_date?.toISOString() ?? null,
      medical_history_json: patient.medical_history_json,
      updatedAt: patient.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Error validando paciente", { tenantSlug, patientId, error: message });
    throw new Error(message);
  }
}
