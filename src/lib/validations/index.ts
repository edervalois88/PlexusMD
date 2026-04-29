import { z } from "zod";

// Validación para Notas SOAP
export const soapNoteSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  analysis: z.string().optional(),
  plan: z.string().optional(),
  reason: z.string().min(5, "El motivo de consulta debe tener al menos 5 caracteres"),
});

// Validación para Creación de Citas
export const appointmentSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  doctorId: z.string().uuid("ID de médico inválido"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha y hora inválidas",
  }),
  reason: z.string().min(3, "El motivo es muy corto").max(255, "Motivo muy largo"),
});

export type SoapNoteInput = z.infer<typeof soapNoteSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
