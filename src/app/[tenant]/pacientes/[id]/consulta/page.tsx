import { notFound } from "next/navigation";

import { getPatientForTenant } from "@/actions/patient";
import fallbackVademecum from "@/data/vademecum.json";
import { getOrganizationSettings } from "@/lib/organization-settings";
import { prisma } from "@/lib/prisma";

import { ConsultationWorkspace } from "./ConsultationWorkspace";

type PageProps = {
  params: Promise<{ tenant: string; id: string }>;
};

type PatientHistory = {
  conditions?: string[];
  previousMeds?: string[];
  allergies?: string[];
  pastNotes?: Array<{ date: string; note: string }>;
};

const asStringArray = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

const toPatientHistory = (value: unknown): PatientHistory => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const history = value as Record<string, unknown>;

  return {
    conditions: asStringArray(history.conditions),
    previousMeds: asStringArray(history.previousMeds),
    allergies: asStringArray(history.allergies),
    pastNotes: Array.isArray(history.pastNotes)
      ? history.pastNotes
          .filter((note): note is { date: string; note: string } => {
            return (
              typeof note === "object" &&
              note !== null &&
              typeof (note as Record<string, unknown>).date === "string" &&
              typeof (note as Record<string, unknown>).note === "string"
            );
          })
          .slice(0, 10)
      : undefined,
  };
};

export default async function ConsultationPage({ params }: PageProps) {
  const { tenant, id } = await params;
  const organization = await prisma.organization.findUnique({
    where: {
      slug: tenant,
    },
  });

  if (!organization) {
    notFound();
  }

  const [patient, dbMedications, settings] = await Promise.all([
    getPatientForTenant(tenant, id),
    prisma.medication.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    getOrganizationSettings(organization.id),
  ]);

  const medications = dbMedications.length
    ? dbMedications.map((medication) => ({
        id: medication.id,
        name: medication.name,
        commonDose: medication.common_dose,
        warnings: asStringArray(medication.warnings),
        legalNotes: medication.legal_notes,
      }))
    : fallbackVademecum.map((medication) => ({
        id: medication.name,
        name: medication.name,
        commonDose: medication.commonDose,
        warnings: medication.warnings,
        legalNotes: null,
      }));

  const customMetadata = settings?.customMetadata ?? {};

  return (
    <ConsultationWorkspace
      patient={{
        id: patient.id,
        organization_id: patient.organization_id,
        full_name: patient.full_name,
        birth_date: patient.birth_date,
        medical_history_json: toPatientHistory(patient.medical_history_json),
        updatedAt: patient.updatedAt,
      }}
      medications={medications}
      branding={{
        clinicName: organization.name,
        logoUrl: typeof customMetadata.logo_url === "string" ? customMetadata.logo_url : null,
        doctorName: typeof customMetadata.doctor_name === "string" ? customMetadata.doctor_name : null,
        doctorSignatureUrl: typeof customMetadata.doctor_signature_url === "string" ? customMetadata.doctor_signature_url : null,
      }}
    />
  );
}
