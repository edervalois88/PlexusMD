/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const test = require("node:test");

const {
  canUseFreeFormWhatsAppReply,
  detectConversationIntent,
  extractFirstTextMessage,
  extractMessageStatusEvents,
  findConfirmedSlot,
  verifyMetaWebhookSignature,
} = require("../src/lib/whatsapp-webhook.ts");

test("verifyMetaWebhookSignature accepts a valid Meta sha256 signature", () => {
  const rawBody = JSON.stringify({ object: "whatsapp_business_account" });
  const appSecret = "test-secret";
  const signature = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;

  assert.equal(verifyMetaWebhookSignature(rawBody, signature, appSecret), true);
});

test("verifyMetaWebhookSignature rejects missing or invalid signatures", () => {
  const rawBody = JSON.stringify({ ok: true });

  assert.equal(verifyMetaWebhookSignature(rawBody, null, "test-secret"), false);
  assert.equal(verifyMetaWebhookSignature(rawBody, "sha256=bad", "test-secret"), false);
});

test("extractFirstTextMessage returns the first inbound text message and phone id", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: {
                phone_number_id: "123456789",
              },
              messages: [
                {
                  id: "wamid.HBgNNTIx",
                  from: "5215555555555",
                  type: "text",
                  text: {
                    body: "Quiero cita manana",
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  assert.deepEqual(extractFirstTextMessage(payload), {
    id: "wamid.HBgNNTIx",
    from: "5215555555555",
    body: "Quiero cita manana",
    phoneNumberId: "123456789",
  });
});

test("findConfirmedSlot supports numbered Spanish confirmations", () => {
  const slots = [
    { start: "2026-05-15T15:00:00.000Z", end: "2026-05-15T15:30:00.000Z", label: "vie, 15 may, 09:00" },
    { start: "2026-05-15T16:00:00.000Z", end: "2026-05-15T16:30:00.000Z", label: "vie, 15 may, 10:00" },
  ];

  assert.equal(findConfirmedSlot("confirmar 2 por favor", slots)?.start, "2026-05-15T16:00:00.000Z");
  assert.equal(findConfirmedSlot("me sirve vie, 15 may, 09:00", slots)?.start, "2026-05-15T15:00:00.000Z");
  assert.equal(findConfirmedSlot("solo estoy preguntando", slots), null);
});

test("detectConversationIntent handles opt-out, opt-in, and human handoff deterministically", () => {
  assert.equal(detectConversationIntent("BAJA").type, "OPT_OUT");
  assert.equal(detectConversationIntent("stop por favor").type, "OPT_OUT");
  assert.equal(detectConversationIntent("ALTA").type, "OPT_IN");
  assert.equal(detectConversationIntent("quiero hablar con una persona").type, "HUMAN_HANDOFF");
  assert.equal(detectConversationIntent("tengo una urgencia").type, "HUMAN_HANDOFF");
  assert.equal(detectConversationIntent("quiero reagendar mi cita").type, "RESCHEDULE");
  assert.equal(detectConversationIntent("cancelar cita").type, "CANCEL");
  assert.equal(detectConversationIntent("hola quiero una cita").type, "ASK_AVAILABILITY");
});

test("canUseFreeFormWhatsAppReply enforces the 24 hour customer care window", () => {
  const now = new Date("2026-05-14T18:00:00.000Z");

  assert.equal(canUseFreeFormWhatsAppReply(new Date("2026-05-13T19:00:00.000Z"), now), true);
  assert.equal(canUseFreeFormWhatsAppReply(new Date("2026-05-13T17:59:59.000Z"), now), false);
});

test("extractMessageStatusEvents returns delivery status events", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: {
                phone_number_id: "123456789",
              },
              statuses: [
                {
                  id: "wamid.HBgNNTIx",
                  recipient_id: "5215555555555",
                  status: "delivered",
                  timestamp: "1778781600",
                },
              ],
            },
          },
        ],
      },
    ],
  };

  assert.deepEqual(extractMessageStatusEvents(payload), [
    {
      providerMessageId: "wamid.HBgNNTIx",
      recipientId: "5215555555555",
      phoneNumberId: "123456789",
      status: "delivered",
      timestamp: new Date("2026-05-14T18:00:00.000Z"),
    },
  ]);
});
