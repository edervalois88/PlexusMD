"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { authOptions } from "@/auth";
import { createAuditLog } from "@/lib/audit";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { getOrganizationSettings } from "@/lib/organization-settings";
import { createAppointmentPaymentLink } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { AppointmentRepository } from "@/lib/repositories/AppointmentRepository";
import { getDataSource, OrganizationEntity } from "@/lib/data-source";
import { logger } from "@/lib/logger";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export type AppointmentActionState = {
  error?: string;
  success?: string;
};

const createAppointmentSchema = z.object({
  tenant: z.string().min(2),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  patientPhone: z.string().trim().optional(),
});

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

const canUseGoogleCalendar = () => Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

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

export async function createAppointmentForTenant(
  _prevState: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  try {
    const parsed = createAppointmentSchema.safeParse({
      tenant: formData.get("tenant"),
      patientId: formData.get("patientId"),
      doctorId: formData.get("doctorId") || undefined,
      startTime: formData.get("startTime"),
      patientPhone: formData.get("patientPhone") || undefined,
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Revisa los datos de la cita.",
      };
    }

    const { tenant, patientId, patientPhone } = parsed.data;
    const startTime = new Date(parsed.data.startTime);
    const endTime = addMinutes(startTime, Number(process.env.APPOINTMENT_DURATION_MINUTES ?? 30));
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantSlug || session.user.tenantSlug !== tenant) {
      return {
        error: "No autorizado para agendar en este tenant.",
      };
    }

    const organization = await prisma.organization.findUnique({
      where: {
        slug: tenant,
      },
      include: {
        settings: true,
      },
    });

    if (!organization?.is_active) {
      return {
        error: "Organizacion no disponible.",
      };
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organization_id: organization.id,
      },
    });

    if (!patient) {
      return {
        error: "Paciente no encontrado en esta clinica.",
      };
    }

    const doctorId = parsed.data.doctorId ?? session.user.id;
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        organization_id: organization.id,
      },
    });

    if (!doctor) {
      return {
        error: "Medico no encontrado en esta clinica.",
      };
    }

    const existingOverlap = await prisma.appointment.findFirst({
      where: {
        organization_id: organization.id,
        doctor_id: doctor.id,
        start_time: {
          gte: startTime,
          lt: endTime,
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (existingOverlap) {
      return {
        error: "El horario ya esta ocupado en la agenda local.",
      };
    }

    const settings = await getOrganizationSettings(organization.id);
    let calendarEventId: string | null = null;
    let calendarLink: string | null = null;

    if (settings?.googleCalendarId || canUseGoogleCalendar()) {
      const calendar = await GoogleCalendarService.forOrganization(organization.id);
      const slotAvailable = await calendar.isSlotAvailable(startTime, endTime);

      if (!slotAvailable) {
        return {
          error: "El horario ya no esta disponible en Google Calendar.",
        };
      }

      const event = await calendar.createEvent({
        summary: `Cita - ${patient.full_name}`,
        description: `Cita creada desde PlexusMD para ${patient.full_name}.`,
        startTime,
        endTime,
        attendeeEmail: doctor.email,
      });
      calendarEventId = event.id;
      calendarLink = event.htmlLink;
    }

    const appointment = await prisma.appointment.create({
      data: {
        organization_id: organization.id,
        doctor_id: doctor.id,
        patient_id: patient.id,
        start_time: startTime,
        status: "SCHEDULED",
        payment_status: "PENDING",
        google_event_id: calendarEventId,
      },
    });

    let paymentUrl: string | null = null;

    if (patientPhone && process.env.STRIPE_SECRET_KEY) {
      paymentUrl = await createAppointmentPaymentLink({
        organizationId: organization.id,
        patientPhone,
        slotStart: startTime.toISOString(),
        stripeAccountId: settings?.stripeAccountId,
      }).catch((error) => {
        console.warn("Stripe payment link creation failed.", error);
        return null;
      });
    }

    if (patientPhone) {
      const paymentText = paymentUrl ? `\nLink de pago: ${paymentUrl}` : "";
      const calendarText = calendarLink ? `\nCalendario: ${calendarLink}` : "";

      await sendWhatsAppMessage(
        patientPhone,
        `Tu cita en ${organization.name} quedo confirmada para ${startTime.toLocaleString("es-MX")}.${paymentText}${calendarText}`,
        {
          accessToken: settings?.whatsappAccessToken,
          phoneNumberId: settings?.whatsappPhoneId,
        },
      ).catch((error) => console.warn("WhatsApp confirmation failed.", error));
    }

    await createAuditLog({
      userId: session.user.id,
      organizationId: organization.id,
      action: "APPOINTMENT_CREATED",
      resource: "Appointment",
      payload: {
        appointmentId: appointment.id,
        patientId: patient.id,
        doctorId: doctor.id,
        startTime: startTime.toISOString(),
        googleEventId: calendarEventId,
        whatsappSent: Boolean(patientPhone),
        paymentLinkCreated: Boolean(paymentUrl),
      },
    });

    revalidatePath(`/${tenant}/agenda`);
    revalidatePath(`/${tenant}/dashboard`);

    return {
      success: "Cita creada y sincronizada.",
    };
  } catch (error) {
    console.error("Appointment creation failed", error);
    return {
      error: error instanceof Error ? error.message : "No se pudo crear la cita.",
    };
  }
}
