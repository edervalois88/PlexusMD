import { getDataSource, AppointmentEntity } from "../data-source";
import { Between } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm";

type AppointmentCreateInput = Omit<Partial<AppointmentEntity>, "id" | "organization_id" | "createdAt" | "updatedAt">;
type AppointmentUpdateInput = QueryDeepPartialEntity<
  Pick<AppointmentEntity, "doctor_id" | "patient_id" | "start_time" | "status" | "payment_status">
>;

export class AppointmentRepository {
  private static requireOrganizationId(organizationId: string) {
    if (!organizationId) {
      throw new Error("organization_id is required for appointment repository operations.");
    }
  }

  static async findOne(organizationId: string, appointmentId: string) {
    AppointmentRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AppointmentEntity);

    return await repo.findOne({
      where: {
        id: appointmentId,
        organization_id: organizationId,
      },
    });
  }

  static async find(organizationId: string) {
    AppointmentRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AppointmentEntity);

    return await repo.find({
      where: {
        organization_id: organizationId,
      },
      order: {
        start_time: "ASC",
      },
    });
  }

  static async save(organizationId: string, appointment: AppointmentCreateInput) {
    AppointmentRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AppointmentEntity);

    return await repo.save(
      repo.create({
        ...appointment,
        organization_id: organizationId,
      }),
    );
  }

  static async update(organizationId: string, appointmentId: string, appointment: AppointmentUpdateInput) {
    AppointmentRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AppointmentEntity);

    await repo.update(
      {
        id: appointmentId,
        organization_id: organizationId,
      },
      appointment,
    );

    return await AppointmentRepository.findOne(organizationId, appointmentId);
  }

  static async findDailyAppointmentsForTenant(organizationId: string, date: Date) {
    AppointmentRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AppointmentEntity);

    // Rango del día completo
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await repo.find({
      where: {
        organization_id: organizationId,
        start_time: Between(startOfDay, endOfDay),
      },
      order: {
        start_time: "ASC",
      },
    });
  }
}
