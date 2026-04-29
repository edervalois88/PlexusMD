"use server";

import { PatientRepository } from "@/lib/repositories/PatientRepository";
import { getDataSource, OrganizationEntity } from "@/lib/data-source";
import { logger } from "@/lib/logger";

const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPatientForTenant(tenantSlug: string, patientId: string) {
  try {
    const dataSource = await getDataSource();
    const orgRepo = dataSource.getRepository(OrganizationEntity);

    // Buscar la organización por slug (tenant)
    const organization = await orgRepo.findOne({
      where: { slug: tenantSlug },
    });

    if (!organization) {
      throw new Error("Organización no encontrada.");
    }

    const patient = uuidLike.test(patientId)
      ? await PatientRepository.findPatientForTenant(organization.id, patientId)
      : await PatientRepository.findGoldenPatientForTenant(organization.id);

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
