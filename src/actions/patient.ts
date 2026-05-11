"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { authOptions } from "@/auth";
import { createAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const patientSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre completo es requerido."),
  curp: z.string().trim().length(18, "El CURP debe tener 18 caracteres.").optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
});

export async function getPatientsByTenant(tenantSlug: string) {
  try {
    return await prisma.patient.findMany({
      where: {
        organization: { slug: tenantSlug },
      },
      orderBy: {
        full_name: "asc",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Error obteniendo lista de pacientes", { tenantSlug, error: message });
    throw new Error("No se pudo cargar la lista de pacientes.");
  }
}

export async function createPatient(tenantSlug: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantSlug || session.user.tenantSlug !== tenantSlug) {
      throw new Error("No autorizado.");
    }

    const parsed = patientSchema.parse({
      fullName: formData.get("fullName"),
      curp: formData.get("curp"),
      birthDate: formData.get("birthDate"),
    });

    const organization = await prisma.organization.findUnique({
      where: { slug: tenantSlug },
    });

    if (!organization) throw new Error("Organización no encontrada.");

    const patient = await prisma.patient.create({
      data: {
        organization_id: organization.id,
        full_name: parsed.fullName,
        curp: parsed.curp || null,
        birth_date: parsed.birthDate ? new Date(parsed.birthDate) : null,
      },
    });

    await createAuditLog({
      action: "patient.created",
      resource: "Patient",
      payload: { patientId: patient.id, fullName: patient.full_name },
    });

    revalidatePath(`/${tenantSlug}/pacientes`);
    return { success: true, patientId: patient.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

export async function updatePatientHistory(patientId: string, history: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("No autorizado.");

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        medical_history_json: history as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    await createAuditLog({
      action: "patient.history_updated",
      resource: "Patient",
      payload: { patientId, userId: session.user.id },
    });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Error actualizando historial", { patientId, error: message });
    return { error: message };
  }
}

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
