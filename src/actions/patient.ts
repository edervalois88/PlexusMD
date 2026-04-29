"use server";

import { PatientRepository } from "@/lib/repositories/PatientRepository";
import { getDataSource, OrganizationEntity } from "@/lib/data-source";
import { logger } from "@/lib/logger";

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

    // Buscar al paciente con el patrón de repositorio asegurando el organization_id
    const patient = await PatientRepository.findPatientForTenant(organization.id, patientId);

    if (!patient) {
      throw new Error("Paciente no encontrado o no pertenece a esta organización.");
    }

    return patient;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Error validando paciente", { tenantSlug, patientId, error: message });
    throw new Error(message);
  }
}
