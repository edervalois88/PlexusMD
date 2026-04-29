import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

import { GoogleCalendarService, type CalendarSlot } from "@/lib/google-calendar";
import { getOrganizationSettingsByWhatsAppPhoneId, type DynamicOrganizationSettings } from "@/lib/organization-settings";
import { createAppointmentPaymentLink } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

type WhatsAppChangeValue = {
  metadata?: {
    phone_number_id?: string;
  };
  messages?: Array<{
    from: string;
    text?: {
      body?: string;
    };
    type?: string;
  }>;
};

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: WhatsAppChangeValue;
    }>;
  }>;
};

const getDefaultOrganization = async () => {
  const configuredSlug = process.env.DEFAULT_TENANT_SLUG;

  if (configuredSlug) {
    const organization = await prisma.organization.findUnique({
      where: { slug: configuredSlug },
    });

    if (organization?.is_active) {
      return organization;
    }
  }

  return await prisma.organization.findFirst({
    where: { is_active: true },
    orderBy: { createdAt: "asc" },
  });
};

const resolveSettingsForWebhook = async (payload: WhatsAppWebhookPayload) => {
  const phoneId = payload.entry?.flatMap((entry) => entry.changes ?? [])[0]?.value?.metadata?.phone_number_id;

  if (phoneId) {
    const settings = await getOrganizationSettingsByWhatsAppPhoneId(phoneId);
    if (settings) return settings;
  }

  const organization = await getDefaultOrganization();
  return organization
    ? {
        organizationId: organization.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        googleCalendarId: null,
        stripeAccountId: organization.stripe_connect_id,
        whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? null,
        whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? null,
        customMetadata: {},
      } satisfies DynamicOrganizationSettings
    : null;
};

const extractFirstMessage = (payload: WhatsAppWebhookPayload) =>
  payload.entry?.flatMap((entry) => entry.changes ?? []).flatMap((change) => change.value?.messages ?? [])[0];

const findConfirmedSlot = (message: string, slots: CalendarSlot[]) => {
  const normalizedMessage = message.toLowerCase();
  const slotNumber = normalizedMessage.match(/\b(?:opcion|opción|slot|confirmo|confirmar|quiero)\s*(\d{1,2})\b/)?.[1];

  if (slotNumber) {
    return slots[Number(slotNumber) - 1];
  }

  return slots.find((slot) => normalizedMessage.includes(slot.label.toLowerCase()) || normalizedMessage.includes(slot.start));
};

const formatSlots = (slots: CalendarSlot[]) => slots.map((slot, index) => `${index + 1}. ${slot.label}`).join("\n");

const generateSchedulingReply = async (organizationId: string, clinicName: string, message: string, slots: CalendarSlot[]) => {
  const apiKey = process.env.GEMINI_API_KEY;

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
  const payload = (await request.json()) as WhatsAppWebhookPayload;
  const message = extractFirstMessage(payload);

  if (!message?.from || !message.text?.body) {
    return NextResponse.json({ received: true });
  }

  const settings = await resolveSettingsForWebhook(payload);

  if (!settings) {
    await sendWhatsAppMessage(message.from, "La clinica no esta disponible por el momento.");
    return NextResponse.json({ received: true });
  }

  const cacheKey = `wa:${message.from}:slots`;
  const cachedSlots = await kv.get<CalendarSlot[]>(cacheKey).catch(() => null);
  const calendarService = await GoogleCalendarService.forOrganization(settings.organizationId);
  const slots = cachedSlots?.length ? cachedSlots : await calendarService.checkAvailability(new Date());
  const confirmedSlot = findConfirmedSlot(message.text.body, slots);

  if (confirmedSlot) {
    const paymentUrl = await createAppointmentPaymentLink({
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
    );
    return NextResponse.json({ received: true, action: "payment_link_sent" });
  }

  await kv.set(cacheKey, slots, { ex: 15 * 60 }).catch(() => undefined);
  const reply = await generateSchedulingReply(settings.organizationId, settings.organizationName, message.text.body, slots);
  await sendWhatsAppMessage(message.from, reply, {
    accessToken: settings.whatsappAccessToken,
    phoneNumberId: settings.whatsappPhoneId,
  });

  return NextResponse.json({ received: true, action: "availability_sent" });
}
