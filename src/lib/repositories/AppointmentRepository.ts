import { getDataSource, AppointmentEntity } from "../data-source";
import { Between } from "typeorm";

export class AppointmentRepository {
  static async findDailyAppointmentsForTenant(organizationId: string, date: Date) {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AppointmentEntity);

    // Rango del día completo
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await repo.find({
      where: {
        organization_id: organizationId, // Regla de Oro: Filtrar siempre por tenant
        start_time: Between(startOfDay, endOfDay),
      },
      order: {
        start_time: "ASC",
      },
    });
  }
}
