import { getDataSource, PatientEntity } from "../data-source";
import { ILike } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm";
import { createAuditLog } from "../audit";

type PatientCreateInput = Omit<Partial<PatientEntity>, "id" | "organization_id" | "createdAt" | "updatedAt">;
type PatientUpdateInput = QueryDeepPartialEntity<Pick<PatientEntity, "full_name" | "curp" | "birth_date" | "medical_history_json">>;

export class PatientRepository {
  private static requireOrganizationId(organizationId: string) {
    if (!organizationId) {
      throw new Error("organization_id is required for patient repository operations.");
    }
  }

  static async findOne(organizationId: string, patientId: string) {
    PatientRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PatientEntity);

    return await repo.findOne({
      where: {
        id: patientId,
        organization_id: organizationId,
      },
    });
  }

  static async find(organizationId: string) {
    PatientRepository.requireOrganizationId(organizationId);

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

  static async save(organizationId: string, patient: PatientCreateInput) {
    PatientRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PatientEntity);

    const savedPatient = await repo.save(
      repo.create({
        ...patient,
        organization_id: organizationId,
      }),
    );

    await createAuditLog({
      organizationId,
      action: "patient.created",
      resource: "Patient",
      payload: {
        patientId: savedPatient.id,
        fullName: savedPatient.full_name,
      },
    });

    return savedPatient;
  }

  static async update(organizationId: string, patientId: string, patient: PatientUpdateInput) {
    PatientRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PatientEntity);

    await repo.update(
      {
        id: patientId,
        organization_id: organizationId,
      },
      patient,
    );

    const updatedPatient = await PatientRepository.findOne(organizationId, patientId);

    await createAuditLog({
      organizationId,
      action: "patient.updated",
      resource: "Patient",
      payload: {
        patientId,
        changedFields: Object.keys(patient),
      },
    });

    return updatedPatient;
  }

  static async findPatientForTenant(organizationId: string, patientId: string) {
    return await PatientRepository.findOne(organizationId, patientId);
  }

  static async findPatientsByTenant(organizationId: string) {
    return await PatientRepository.find(organizationId);
  }

  static async findGoldenPatientForTenant(organizationId: string) {
    PatientRepository.requireOrganizationId(organizationId);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PatientEntity);

    return await repo.findOne({
      where: {
        organization_id: organizationId,
        full_name: ILike("%Roberto Castañeda%"),
      },
      order: {
        createdAt: "ASC",
      },
    });
  }
}
