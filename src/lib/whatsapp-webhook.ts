import { createHmac, timingSafeEqual } from "crypto";

export type CalendarSlotLike = {
  start: string;
  end: string;
  label: string;
};

export type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          phone_number_id?: string;
        };
        messages?: Array<{
          id?: string;
          from?: string;
          text?: {
            body?: string;
          };
          type?: string;
        }>;
        statuses?: Array<{
          id?: string;
          recipient_id?: string;
          status?: string;
          timestamp?: string;
        }>;
      };
    }>;
  }>;
};

export type InboundWhatsAppTextMessage = {
  id: string | null;
  from: string;
  body: string;
  phoneNumberId: string | null;
};

export type WhatsAppConversationIntent =
  | { type: "OPT_OUT" }
  | { type: "OPT_IN" }
  | { type: "HUMAN_HANDOFF" }
  | { type: "CANCEL" }
  | { type: "RESCHEDULE" }
  | { type: "ASK_AVAILABILITY" }
  | { type: "UNKNOWN" };

export type WhatsAppMessageStatusEvent = {
  providerMessageId: string;
  recipientId: string;
  phoneNumberId: string | null;
  status: string;
  timestamp: Date | null;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const verifyMetaWebhookSignature = (rawBody: string, signatureHeader: string | null, appSecret?: string | null) => {
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(received, "hex");

    return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
};

export const extractFirstTextMessage = (payload: WhatsAppWebhookPayload): InboundWhatsAppTextMessage | null => {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id ?? null;

      for (const message of change.value?.messages ?? []) {
        if (message.type !== "text" || !message.from || !message.text?.body) {
          continue;
        }

        return {
          id: message.id ?? null,
          from: message.from,
          body: message.text.body,
          phoneNumberId,
        };
      }
    }
  }

  return null;
};

export const extractMessageStatusEvents = (payload: WhatsAppWebhookPayload): WhatsAppMessageStatusEvent[] => {
  const events: WhatsAppMessageStatusEvent[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id ?? null;

      for (const status of change.value?.statuses ?? []) {
        if (!status.id || !status.recipient_id || !status.status) {
          continue;
        }

        const timestampSeconds = status.timestamp ? Number(status.timestamp) : Number.NaN;

        events.push({
          providerMessageId: status.id,
          recipientId: status.recipient_id,
          phoneNumberId,
          status: status.status,
          timestamp: Number.isFinite(timestampSeconds) ? new Date(timestampSeconds * 1000) : null,
        });
      }
    }
  }

  return events;
};

export const detectConversationIntent = (message: string): WhatsAppConversationIntent => {
  const normalized = normalizeText(message);

  if (/^(baja|stop|unsubscribe|cancelar mensajes|no mensajes)\b/.test(normalized)) {
    return { type: "OPT_OUT" };
  }

  if (/^(alta|start|reanudar|suscribir|activar mensajes)\b/.test(normalized)) {
    return { type: "OPT_IN" };
  }

  if (/\b(humano|persona|asesor|recepcion|recepcionista|operador|urgencia|emergencia|emergente)\b/.test(normalized)) {
    return { type: "HUMAN_HANDOFF" };
  }

  if (/\b(cancelar|cancela|cancelacion)\b/.test(normalized)) {
    return { type: "CANCEL" };
  }

  if (/\b(reagendar|reprogramar|cambiar|mover)\b/.test(normalized)) {
    return { type: "RESCHEDULE" };
  }

  if (/\b(cita|agenda|agendar|horario|disponible|disponibilidad|consulta|reservar)\b/.test(normalized)) {
    return { type: "ASK_AVAILABILITY" };
  }

  return { type: "UNKNOWN" };
};

export const canUseFreeFormWhatsAppReply = (lastInboundAt: Date | null | undefined, now = new Date()) => {
  if (!lastInboundAt) {
    return false;
  }

  return now.getTime() - lastInboundAt.getTime() <= 24 * 60 * 60 * 1000;
};

export const findConfirmedSlot = (message: string, slots: CalendarSlotLike[]) => {
  const normalizedMessage = message.toLowerCase();
  const slotNumber = normalizedMessage.match(/\b(?:opcion|opción|slot|confirmo|confirmar|quiero|elijo)\s*(\d{1,2})\b/)?.[1];

  if (slotNumber) {
    return slots[Number(slotNumber) - 1] ?? null;
  }

  return slots.find((slot) => normalizedMessage.includes(slot.label.toLowerCase()) || normalizedMessage.includes(slot.start)) ?? null;
};

export const formatSlots = (slots: CalendarSlotLike[]) => slots.map((slot, index) => `${index + 1}. ${slot.label}`).join("\n");
