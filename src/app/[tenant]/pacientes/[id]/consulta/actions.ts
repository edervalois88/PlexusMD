"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { buildAiAuditPayload } from "@/lib/ai-audit";
import { createAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type MedicationInput = {
  name: string;
  commonDose: string;
  warnings?: string[];
  legalNotes?: string | null;
};

type PatientHistory = {
  conditions?: string[];
  previousMeds?: string[];
  allergies?: string[];
  pastNotes?: Array<{ date: string; note: string }>;
};

const medicationSchema = z.object({
  name: z.string(),
  commonDose: z.string(),
  warnings: z.array(z.string()).optional(),
  legalNotes: z.string().nullable().optional(),
});

const patientHistorySchema = z.object({
  conditions: z.array(z.string()).optional(),
  previousMeds: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  pastNotes: z.array(z.object({ date: z.string(), note: z.string() })).optional(),
});

const SIDE_DOCTOR_MODEL = "gemini-1.5-pro";

const detectLocalMedicationAlerts = (medication: MedicationInput, patientHistory: PatientHistory, selectedMedications: MedicationInput[]) => {
  const alerts: string[] = [];
  const normalizedMedication = medication.name.toLowerCase();
  const allergies = patientHistory.allergies ?? [];
  const previousMeds = patientHistory.previousMeds ?? [];

  for (const allergy of allergies) {
    const normalizedAllergy = allergy.toLowerCase();

    if (
      normalizedMedication.includes(normalizedAllergy) ||
      medication.warnings?.some((warning) => warning.toLowerCase().includes(normalizedAllergy))
    ) {
      alerts.push(`Alerta de alergia: ${medication.name} puede ser relevante para alergia registrada a ${allergy}.`);
    }
  }

  for (const existing of previousMeds) {
    const existingBase = existing.toLowerCase().split(/\s+/)[0];
    if (existingBase && normalizedMedication.includes(existingBase)) {
      alerts.push(`Duplicidad potencial: el paciente ya usa ${existing}.`);
    }
  }

  if (selectedMedications.some((item) => item.name.toLowerCase() === normalizedMedication)) {
    alerts.push(`Duplicidad en receta: ${medication.name} ya fue seleccionado.`);
  }

  if (normalizedMedication.includes("aspirina") && allergies.some((allergy) => /ibuprofeno|aine|aines/i.test(allergy))) {
    alerts.push("Precaución: antecedente de alergia a AINEs; validar riesgo antes de indicar aspirina.");
  }

  return alerts;
};

export async function validateMedicationSelection(input: {
  medication: MedicationInput;
  patientHistory: PatientHistory;
  selectedMedications: MedicationInput[];
  organizationId?: string;
}) {
  const medication = medicationSchema.parse(input.medication);
  const patientHistory = patientHistorySchema.parse(input.patientHistory);
  const selectedMedications = z.array(medicationSchema).parse(input.selectedMedications);
  const alerts = detectLocalMedicationAlerts(medication, patientHistory, selectedMedications);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const localRecommendation = alerts.length
      ? "Validación local completada. Confirma clínicamente antes de recetar."
      : "Sin alertas locales evidentes.";

    await createAuditLog({
      organizationId: input.organizationId,
      action: "ai.side_doctor.medication_validated",
      resource: "SideDoctor",
      payload: {
        ...buildAiAuditPayload(localRecommendation, null, "local-rules"),
        medicationName: medication.name,
        alertCount: alerts.length,
        aiEnabled: false,
      },
    });

    return {
      alerts,
      aiNote: localRecommendation,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: SIDE_DOCTOR_MODEL,
    systemInstruction:
      "Eres Side Doctor. Valida alergias e interacciones medicamentosas potenciales. No inventes dosis. Responde en 2-4 bullets clínicos, con tono prudente.",
  });

  const result = await model.generateContent(`
Medicamento seleccionado: ${JSON.stringify(medication)}
Medicamentos ya seleccionados: ${JSON.stringify(selectedMedications)}
Historial del paciente: ${JSON.stringify(patientHistory)}
Alertas locales detectadas: ${JSON.stringify(alerts)}
`);
  const response = await result.response;
  const responseText = response.text();

  if (input.organizationId) {
    await prisma.organization.update({
      where: { id: input.organizationId },
      data: { ai_usage_count: { increment: 1 } },
    });
  }

  await createAuditLog({
    organizationId: input.organizationId,
    action: "ai.side_doctor.medication_validated",
    resource: "SideDoctor",
    payload: {
      ...buildAiAuditPayload(responseText, response, SIDE_DOCTOR_MODEL),
      medicationName: medication.name,
      alertCount: alerts.length,
      aiEnabled: true,
    },
  });

  return {
    alerts,
    aiNote: responseText,
  };
}

export async function streamConsultationInsights(input: {
  patientName: string;
  patientHistory: PatientHistory;
  note: string;
  selectedMedications: MedicationInput[];
  organizationId?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const chunks = [
      `Analizando ${input.patientName}...\n`,
      "- Revisar alergias registradas antes de firmar receta.\n",
      "- Validar duplicidades con medicamentos previos.\n",
      "- Confirmar que la nota SOAP incluya plan y seguimiento.\n",
    ];

    await createAuditLog({
      organizationId: input.organizationId,
      action: "ai.side_doctor.consultation_streamed",
      resource: "SideDoctor",
      payload: buildAiAuditPayload(chunks.join(""), null, "local-rules"),
    });

    return {
      chunks,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: SIDE_DOCTOR_MODEL,
    systemInstruction:
      "Eres Side Doctor durante una consulta. Genera insights clínicos breves y accionables. Enfócate en alergias, interacciones, lagunas en SOAP y preguntas de seguimiento. No diagnostiques.",
  });

  const result = await model.generateContentStream(`
Paciente: ${input.patientName}
Historial: ${JSON.stringify(input.patientHistory)}
Nota actual: ${input.note}
Medicamentos seleccionados: ${JSON.stringify(input.selectedMedications)}
`);
  const chunks: string[] = [];

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) chunks.push(text);
  }

  const response = await result.response;
  const responseText = chunks.join("");

  if (input.organizationId) {
    await prisma.organization.update({
      where: { id: input.organizationId },
      data: { ai_usage_count: { increment: 1 } },
    });
  }

  await createAuditLog({
    organizationId: input.organizationId,
    action: "ai.side_doctor.consultation_streamed",
    resource: "SideDoctor",
    payload: buildAiAuditPayload(responseText, response, SIDE_DOCTOR_MODEL),
  });

  return { chunks };
}
