"use server";

import { AppointmentRepository } from "@/lib/repositories/AppointmentRepository";
import { getDataSource, OrganizationEntity } from "@/lib/data-source";
import { logger } from "@/lib/logger";

export async function getDailyAppointmentsForTenant(tenantSlug: string, date: Date) {
  try {
    const dataSource = await getDataSource();
    const orgRepo = dataSource.getRepository(OrganizationEntity);

    // 1. Obtener la Organización
    const organization = await orgRepo.findOne({
      where: { slug: tenantSlug },
    });

    if (!organization) {
      throw new Error("Organización no encontrada.");
    }

    // 2. Obtener Citas usando el Patrón de Repositorio (Regla de Oro: organization_id implícito)
    const appointments = await AppointmentRepository.findDailyAppointmentsForTenant(organization.id, date);

    return appointments;
  } catch (error: unknown) {
    // Manejo de Error Global
    const message = error instanceof Error ? error.message : String(error);
    const errorId = logger.error("Error al obtener la agenda diaria", { tenantSlug, date, error: message });
    throw new Error(`Ocurrió un error interno. Código de referencia: ${errorId}`);
  }
}
