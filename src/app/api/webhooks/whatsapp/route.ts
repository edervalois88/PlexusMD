import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { GoogleCalendarService, type CalendarSlot } from "@/lib/google-calendar";
import { getOrganizationSettingsByWhatsAppPhoneId, type DynamicOrganizationSettings } from "@/lib/organization-settings";
import { createAppointmentPaymentLink } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { createAuditLog } from "@/lib/audit";
import {
  detectConversationIntent,
  extractFirstTextMessage,
  extractMessageStatusEvents,
  findConfirmedSlot,
  formatSlots,
  verifyMetaWebhookSignature,
  type CalendarSlotLike,
  type InboundWhatsAppTextMessage,
  type WhatsAppWebhookPayload,
} from "@/lib/whatsapp-webhook";

const APPOINTMENT_DURATION_MINUTES = Number(process.env.APPOINTMENT_DURATION_MINUTES ?? 30);
const RESERVATION_HOLD_MINUTES = Number(process.env.WHATSAPP_RESERVATION_HOLD_MINUTES ?? 15);

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

const resolveSettingsForWebhook = async (phoneId: string | null) => {
  if (!phoneId) {
    return null;
  }

  return await getOrganizationSettingsByWhatsAppPhoneId(phoneId);
};

const getConversationSlots = (value: Prisma.JsonValue | null | undefined): CalendarSlot[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((slot): slot is CalendarSlot => {
    if (!slot || typeof slot !== "object" || Array.isArray(slot)) return false;
    const candidate = slot as Record<string, unknown>;

    return (
      typeof candidate.start === "string" &&
      typeof candidate.end === "string" &&
      typeof candidate.label === "string"
    );
  });
};

const generateSchedulingReply = async (organizationId: string, clinicName: string, message: string, slots: CalendarSlot[]) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (slots.length === 0) {
    return `Hola, soy el asistente de ${clinicName}. Por ahora no veo horarios disponibles para hoy. Te puedo ayudar a revisar otra fecha.`;
  }

  if (!apiKey) {
    return `Hola, soy el asistente de ${clinicName}. Tengo estos horarios disponibles:\n${formatSlots(slots)}\nResponde "confirmar 1" para apartar una opcion.`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: `Eres el asistente de la clinica ${clinicName}. Revisa esta disponibilidad y ayuda al paciente a elegir un horario. No inventes horarios. Responde breve y amable por WhatsApp.`,
  });

  const result = await model.generateContent(`Mensaje del paciente: ${message}\n\nSlots disponibles:\n${formatSlots(slots)}`);
  const response = await result.response;
  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      ai_usage_count: {
        increment: 1,
      },
    },
  });
  return response.text();
};

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";

const beginMessageProcessing = async (message: InboundWhatsAppTextMessage, settings: DynamicOrganizationSettings) => {
  if (!message.id) {
    return true;
  }

  try {
    await prisma.whatsappProcessedMessage.create({
      data: {
        provider_message_id: message.id,
        organization_id: settings.organizationId,
        patient_phone: message.from,
        action: "processing",
      },
    });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return false;
    }

    throw error;
  }
};

const markMessageProcessed = async (message: InboundWhatsAppTextMessage, action: string) => {
  if (!message.id) return;

  await prisma.whatsappProcessedMessage.update({
    where: {
      provider_message_id: message.id,
    },
    data: {
      action,
    },
  }).catch(() => undefined);
};

const recordStatusEvents = async (payload: WhatsAppWebhookPayload) => {
  const events = extractMessageStatusEvents(payload);

  for (const event of events) {
    const settings = await resolveSettingsForWebhook(event.phoneNumberId);

    await prisma.whatsappMessageStatus.upsert({
      where: {
        provider_message_id_status: {
          provider_message_id: event.providerMessageId,
          status: event.status,
        },
      },
      create: {
        provider_message_id: event.providerMessageId,
        organization_id: settings?.organizationId,
        recipient_id: event.recipientId,
        status: event.status,
        provider_timestamp: event.timestamp,
        raw_payload: {
          providerMessageId: event.providerMessageId,
          recipientId: event.recipientId,
          phoneNumberId: event.phoneNumberId,
          status: event.status,
          timestamp: event.timestamp?.toISOString() ?? null,
        },
      },
      update: {
        organization_id: settings?.organizationId,
        recipient_id: event.recipientId,
        provider_timestamp: event.timestamp,
        raw_payload: {
          providerMessageId: event.providerMessageId,
          recipientId: event.recipientId,
          phoneNumberId: event.phoneNumberId,
          status: event.status,
          timestamp: event.timestamp?.toISOString() ?? null,
        },
      },
    }).catch((error) => console.warn("WhatsApp status event write failed.", error));
  }

  return events.length;
};

const getOrCreateWhatsappPatient = async (organizationId: string, phone: string) => {
  const existingPatient = await prisma.patient.findFirst({
    where: {
      organization_id: organizationId,
      phone_number: phone,
    },
  });

  if (existingPatient) {
    return existingPatient;
  }

  return await prisma.patient.create({
    data: {
      organization_id: organizationId,
      full_name: `Paciente WhatsApp ${phone}`,
      phone_number: phone,
      medical_history_json: {
        source: "whatsapp",
      },
    },
  });
};

const resolveDefaultDoctor = async (settings: DynamicOrganizationSettings) => {
  const configuredDoctorId = settings.customMetadata.defaultDoctorId;

  if (typeof configuredDoctorId === "string") {
    const configuredDoctor = await prisma.user.findFirst({
      where: {
        id: configuredDoctorId,
        organization_id: settings.organizationId,
      },
    });

    if (configuredDoctor) {
      return configuredDoctor;
    }
  }

  return await prisma.user.findFirst({
    where: {
      organization_id: settings.organizationId,
      role: {
        in: ["DOCTOR", "ADMIN"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

const reserveAppointmentFromWhatsapp = async ({
  settings,
  patientPhone,
  slot,
}: {
  settings: DynamicOrganizationSettings;
  patientPhone: string;
  slot: CalendarSlotLike;
}) => {
  const startTime = new Date(slot.start);
  const endTime = slot.end ? new Date(slot.end) : addMinutes(startTime, APPOINTMENT_DURATION_MINUTES);
  const [patient, doctor] = await Promise.all([
    getOrCreateWhatsappPatient(settings.organizationId, patientPhone),
    resolveDefaultDoctor(settings),
  ]);

  if (!doctor) {
    throw new Error("No default doctor configured for WhatsApp scheduling.");
  }

  const existingOverlap = await prisma.appointment.findFirst({
    where: {
      organization_id: settings.organizationId,
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
    return null;
  }

  const calendar = await GoogleCalendarService.forOrganization(settings.organizationId);
  const slotAvailable = await calendar.isSlotAvailable(startTime, endTime);

  if (!slotAvailable) {
    return null;
  }

  const event = await calendar.createEvent({
    summary: `Cita - ${patient.full_name}`,
    description: `Cita solicitada desde WhatsApp para ${patient.full_name}.`,
    startTime,
    endTime,
    attendeeEmail: doctor.email,
  });

  const appointment = await prisma.appointment.create({
    data: {
      organization_id: settings.organizationId,
      doctor_id: doctor.id,
      patient_id: patient.id,
      start_time: startTime,
      status: "SCHEDULED",
      payment_status: "PENDING",
      google_event_id: event.id,
      reservation_expires_at: addMinutes(new Date(), RESERVATION_HOLD_MINUTES),
    },
  });

  return {
    appointment,
    calendarEventId: event.id,
    reused: false,
  };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: "Invalid verification token" }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (process.env.NODE_ENV === "production" || appSecret) {
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifyMetaWebhookSignature(rawBody, signature, appSecret)) {
      return NextResponse.json({ error: "Invalid WhatsApp signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);
  const statusEventCount = await recordStatusEvents(payload);
  const message = extractFirstTextMessage(payload);

  if (!message) {
    return NextResponse.json({ received: true, statusEvents: statusEventCount });
  }

  const settings = await resolveSettingsForWebhook(message.phoneNumberId);

  if (!settings) {
    return NextResponse.json({ received: true, action: "unknown_phone_number" });
  }

  const shouldProcess = await beginMessageProcessing(message, settings);

  if (!shouldProcess) {
    return NextResponse.json({ received: true, action: "duplicate_ignored" });
  }

  const conversation = await prisma.whatsappConversation.upsert({
    where: {
      organization_id_patient_phone: {
        organization_id: settings.organizationId,
        patient_phone: message.from,
      },
    },
    create: {
      organization_id: settings.organizationId,
      patient_phone: message.from,
      last_message_at: new Date(),
      last_intent: "inbound",
      current_state: "INBOUND_RECEIVED",
    },
    update: {
      last_message_at: new Date(),
      last_intent: "inbound",
      current_state: "INBOUND_RECEIVED",
    },
  });

  const intent = detectConversationIntent(message.body);

  if (conversation.status === "OPTED_OUT" && intent.type !== "OPT_IN") {
    await markMessageProcessed(message, "opted_out_ignored");
    return NextResponse.json({ received: true, action: "opted_out_ignored" });
  }

  if (conversation.status === "HUMAN_HANDOFF" && intent.type !== "OPT_IN" && intent.type !== "OPT_OUT") {
    await markMessageProcessed(message, "human_handoff_ignored");
    return NextResponse.json({ received: true, action: "human_handoff_ignored" });
  }

  if (intent.type === "OPT_OUT") {
    await prisma.whatsappConversation.update({
      where: { id: conversation.id },
      data: {
        status: "OPTED_OUT",
        current_state: "OPTED_OUT",
        last_intent: "opt_out",
        opted_out_at: new Date(),
        last_slots: [],
      },
    });
    await sendWhatsAppMessage(message.from, "Listo. Ya no recibiras mensajes de esta clinica por WhatsApp. Responde ALTA si deseas reactivarlos.", {
      accessToken: settings.whatsappAccessToken,
      phoneNumberId: settings.whatsappPhoneId,
    }).catch((error) => console.warn("WhatsApp opt-out confirmation failed.", error));
    await markMessageProcessed(message, "opt_out");
    return NextResponse.json({ received: true, action: "opt_out" });
  }

  if (intent.type === "OPT_IN") {
    await prisma.whatsappConversation.update({
      where: { id: conversation.id },
      data: {
        status: "ACTIVE",
        current_state: "OPTED_IN",
        last_intent: "opt_in",
        opt_in_at: new Date(),
        opted_out_at: null,
      },
    });
    await sendWhatsAppMessage(message.from, "Tus mensajes por WhatsApp quedaron activos nuevamente. Puedo ayudarte a agendar una cita.", {
      accessToken: settings.whatsappAccessToken,
      phoneNumberId: settings.whatsappPhoneId,
    }).catch((error) => console.warn("WhatsApp opt-in confirmation failed.", error));
    await markMessageProcessed(message, "opt_in");
    return NextResponse.json({ received: true, action: "opt_in" });
  }

  if (intent.type === "HUMAN_HANDOFF" || intent.type === "CANCEL" || intent.type === "RESCHEDULE") {
    const reason = intent.type.toLowerCase();
    await prisma.whatsappConversation.update({
      where: { id: conversation.id },
      data: {
        status: "HUMAN_HANDOFF",
        current_state: "HUMAN_HANDOFF",
        last_intent: reason,
        handoff_requested_at: new Date(),
        last_handoff_reason: reason,
      },
    });
    await createAuditLog({
      organizationId: settings.organizationId,
      action: "whatsapp.human_handoff_requested",
      resource: "WhatsappConversation",
      payload: {
        patientPhone: message.from,
        reason,
        message: message.body,
      },
    });
    await sendWhatsAppMessage(
      message.from,
      "Te vamos a conectar con el equipo de la clinica. Si es una urgencia medica, llama a emergencias o acude al servicio de urgencias mas cercano.",
      {
        accessToken: settings.whatsappAccessToken,
        phoneNumberId: settings.whatsappPhoneId,
      },
    ).catch((error) => console.warn("WhatsApp handoff message failed.", error));
    await markMessageProcessed(message, "human_handoff");
    return NextResponse.json({ received: true, action: "human_handoff" });
  }

  const cachedSlots = getConversationSlots(conversation.last_slots);
  const calendarService = await GoogleCalendarService.forOrganization(settings.organizationId);
  const slots = cachedSlots.length ? cachedSlots : await calendarService.checkAvailability(new Date());
  const confirmedSlot = findConfirmedSlot(message.body, slots);

  if (confirmedSlot) {
    const reservation = await reserveAppointmentFromWhatsapp({
      settings,
      patientPhone: message.from,
      slot: confirmedSlot,
    });

    if (!reservation) {
      await sendWhatsAppMessage(
        message.from,
        "Ese horario ya no esta disponible. Te comparto nuevas opciones en un momento.",
        {
          accessToken: settings.whatsappAccessToken,
          phoneNumberId: settings.whatsappPhoneId,
        },
      ).catch((error) => console.warn("WhatsApp unavailable slot message failed.", error));
      await markMessageProcessed(message, "slot_unavailable");
      return NextResponse.json({ received: true, action: "slot_unavailable" });
    }

    const paymentUrl = await createAppointmentPaymentLink({
      appointmentId: reservation.appointment.id,
      organizationId: settings.organizationId,
      patientPhone: message.from,
      slotStart: confirmedSlot.start,
      stripeAccountId: settings.stripeAccountId,
    });

    await sendWhatsAppMessage(
      message.from,
      `Perfecto. Apartamos ${confirmedSlot.label}. Para confirmar tu cita, realiza el pago aqui: ${paymentUrl}`,
      {
        accessToken: settings.whatsappAccessToken,
        phoneNumberId: settings.whatsappPhoneId,
      },
    ).catch((error) => console.warn("WhatsApp payment link message failed.", error));
    await prisma.whatsappConversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        last_intent: "payment_link_sent",
        current_state: "WAITING_PAYMENT",
        last_slots: [],
      },
    });
    await createAuditLog({
      organizationId: settings.organizationId,
      action: "whatsapp.appointment_reserved",
      resource: "WhatsappConversation",
      payload: {
        appointmentId: reservation.appointment.id,
        patientPhone: message.from,
        slotStart: confirmedSlot.start,
        reusedExistingAppointment: reservation.reused,
      },
    });
    await markMessageProcessed(message, "payment_link_sent");
    return NextResponse.json({ received: true, action: "payment_link_sent" });
  }

  await prisma.whatsappConversation.update({
    where: {
      id: conversation.id,
    },
      data: {
        last_slots: slots as unknown as Prisma.InputJsonValue,
        last_intent: "availability_sent",
        current_state: "WAITING_SLOT_CONFIRMATION",
      },
  });
  const reply = await generateSchedulingReply(settings.organizationId, settings.organizationName, message.body, slots);
  await sendWhatsAppMessage(message.from, reply, {
    accessToken: settings.whatsappAccessToken,
    phoneNumberId: settings.whatsappPhoneId,
  }).catch((error) => console.warn("WhatsApp availability message failed.", error));

  await markMessageProcessed(message, "availability_sent");
  return NextResponse.json({ received: true, action: "availability_sent" });
}
