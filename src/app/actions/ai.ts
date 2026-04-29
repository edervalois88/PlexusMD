"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `Actúas como un asistente médico de élite. Tu objetivo es analizar el expediente y extraer:
1. Alertas críticas (alergias, interacciones),
2. Resumen de tendencias (ej. glucosa al alza),
3. Sugerencia de preguntas clave para el médico.
No diagnostiques, solo asiste. Por favor, formatea la respuesta en una lista de puntos (bullet points) clara y elegante.`;

export async function analyzePatientInsight(patientHistory: any, reason: string, organizationId?: string) {
  // Sanitización de Datos (Zod)
  const safeReason = z.string().min(5).max(1000).parse(reason);

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: systemInstruction,
    });

    const prompt = `Motivo de la consulta actual: ${safeReason}
    
Expediente Médico:
${JSON.stringify(patientHistory, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Telemetría: Incrementar cuota si se pasa el organizationId
    if (organizationId) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { ai_usage_count: { increment: 1 } },
      });
    }

    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate AI insights.");
  }
}
