-- WhatsApp scheduling hardening: patient phone lookup, persistent conversation state,
-- and inbound message idempotency.

ALTER TABLE "Patient" ADD COLUMN "phone_number" TEXT;

ALTER TABLE "Appointment" ADD COLUMN "reservation_expires_at" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "cancellation_reason" TEXT;

CREATE INDEX "Patient_organization_id_phone_number_idx" ON "Patient"("organization_id", "phone_number");

CREATE TABLE "WhatsappConversation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "last_slots" JSONB DEFAULT '[]',
    "last_intent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "current_state" TEXT NOT NULL DEFAULT 'IDLE',
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opt_in_at" TIMESTAMP(3),
    "opted_out_at" TIMESTAMP(3),
    "handoff_requested_at" TIMESTAMP(3),
    "last_handoff_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsappProcessedMessage" (
    "id" TEXT NOT NULL,
    "provider_message_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "patient_phone" TEXT,
    "action" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappProcessedMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsappMessageStatus" (
    "id" TEXT NOT NULL,
    "provider_message_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "recipient_id" TEXT,
    "status" TEXT NOT NULL,
    "provider_timestamp" TIMESTAMP(3),
    "raw_payload" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappMessageStatus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WhatsappConversation_organization_id_patient_phone_key"
ON "WhatsappConversation"("organization_id", "patient_phone");

CREATE INDEX "WhatsappConversation_organization_id_updatedAt_idx"
ON "WhatsappConversation"("organization_id", "updatedAt");

CREATE UNIQUE INDEX "WhatsappProcessedMessage_provider_message_id_key"
ON "WhatsappProcessedMessage"("provider_message_id");

CREATE INDEX "WhatsappProcessedMessage_organization_id_createdAt_idx"
ON "WhatsappProcessedMessage"("organization_id", "createdAt");

CREATE UNIQUE INDEX "WhatsappMessageStatus_provider_message_id_status_key"
ON "WhatsappMessageStatus"("provider_message_id", "status");

CREATE INDEX "WhatsappMessageStatus_organization_id_createdAt_idx"
ON "WhatsappMessageStatus"("organization_id", "createdAt");

ALTER TABLE "WhatsappConversation"
ADD CONSTRAINT "WhatsappConversation_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WhatsappProcessedMessage"
ADD CONSTRAINT "WhatsappProcessedMessage_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WhatsappMessageStatus"
ADD CONSTRAINT "WhatsappMessageStatus_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
