import { getDataSource, PatientEntity } from "../data-source";

export class PatientRepository {
  static async findPatientForTenant(organizationId: string, patientId: string) {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PatientEntity);

    return await repo.findOne({
      where: {
        id: patientId,
        organization_id: organizationId, // Regla de Oro: Filtrar siempre por tenant
      },
    });
  }

  static async findPatientsByTenant(organizationId: string) {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PatientEntity);

    return await repo.find({
      where: {
        organization_id: organizationId,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}
