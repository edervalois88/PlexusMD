# WhatsApp Product Handoff - 2026-05-14

## Current State

- Production is deployed at `https://plexusmd.xyz`.
- The WhatsApp webhook endpoint is live at `https://plexusmd.xyz/api/webhooks/whatsapp`.
- Meta webhook verification is configured and the `messages` field test succeeds.
- External cron is configured on `cron-job.org` and can successfully call:
  - `https://plexusmd.xyz/api/cron/expire-whatsapp-reservations`
- `CRON_SECRET` was rotated and validated with a successful `200 OK` test run.
- The Prisma schema changes were applied directly to the existing database and marked as applied:
  - `20260514120000_whatsapp_market_ready`

## What Was Implemented

- Webhook signature verification with `WHATSAPP_APP_SECRET`.
- Inbound message idempotency using `WhatsappProcessedMessage`.
- Persistent WhatsApp conversation state using `WhatsappConversation`.
- Delivery/read status persistence using `WhatsappMessageStatus`.
- Deterministic intent handling for:
  - opt-out
  - opt-in
  - human handoff
  - cancel
  - reschedule
  - availability request
- Reservation hold expiry support:
  - `reservation_expires_at`
  - cron endpoint to cancel expired unpaid reservations
- Stripe payment link metadata now carries `appointmentId`.
- Stripe webhook now resolves `appointmentId` from checkout session or payment link metadata.
- Basic test coverage for webhook helpers and intent classification.

## Root Cause Of The Current Blocker

Inbound WhatsApp messages reach Meta and the webhook subscription is correct, but the bot does not reply because production data is incomplete.

The code resolves the clinic from `message.metadata.phone_number_id`, but no production `OrganizationSettings` row currently contains the real `whatsapp_phone_id`.

We partially configured one active clinic in the database:

- Organization:
  - `id`: `c1d49ccd-cc76-4985-9fb4-03fa3716e9cc`
  - `name`: `Murray - Welch`
  - `slug`: `clinica-evturl`
- Default doctor selected:
  - `8fe08a38-579d-46ff-bfb9-81e710364561`

However, the actual values for:

- `WHATSAPP_PHONE_NUMBER_ID`
- `GOOGLE_CALENDAR_ID`

could not be read back from Vercel CLI because Vercel masks sensitive values in pulled production env files. As a result, the DB row was created but those fields are still null.

## Immediate Next Step

Provide these two values manually:

```text
WHATSAPP_PHONE_NUMBER_ID=...
GOOGLE_CALENDAR_ID=...
```

Then run an update against `organization_settings` for:

- `organization_id = c1d49ccd-cc76-4985-9fb4-03fa3716e9cc`

with:

- `whatsapp_phone_id = WHATSAPP_PHONE_NUMBER_ID`
- `google_calendar_id = GOOGLE_CALENDAR_ID`
- `custom_metadata.defaultDoctorId = 8fe08a38-579d-46ff-bfb9-81e710364561`

After that, test again from a real phone with:

```text
Hola, quiero agendar una cita
```

## Meta / WhatsApp Status

Templates already prepared:

- Existing and configured:
  - `confirmacion_cita`
  - Language: `Spanish (MEX)`
  - Variables:
    - `{{1}}` patient name
    - `{{2}}` appointment datetime
- Sent for review:
  - `pago_pendiente_cita`
  - `cancelacion_cita_es_mx`

Notes:

- There was one cancellation template created in English by mistake.
- Keep using the Spanish template version for product behavior.

## Hobby-Compatible Operations

Vercel Hobby does not allow a `*/15 * * * *` cron schedule.

Because of that:

- `vercel.json` was changed to:
  - `"crons": []`
- The system currently depends on external cron from `cron-job.org`.

The cron-job.org request should be:

- Method: `GET`
- URL:
  - `https://plexusmd.xyz/api/cron/expire-whatsapp-reservations`
- Header:
  - `Authorization: Bearer <CRON_SECRET>`

## Pending Product Work

### Required to finish the current WA flow

- Populate production `OrganizationSettings` with the real `whatsapp_phone_id`.
- Populate production `OrganizationSettings` with the real `google_calendar_id`.
- Re-test inbound message response from a real phone.
- Confirm that availability lookup works with the target clinic calendar.
- Confirm that slot selection creates an appointment and payment link.
- Confirm Stripe payment updates `payment_status = PAID`.

### Recommended next product steps

- Switch outbound messages outside the 24-hour customer care window to template messages.
- Wire `sendWhatsAppTemplateMessage()` into:
  - appointment confirmation
  - payment reminder
  - cancellation
- Build an operations view for:
  - `HUMAN_HANDOFF`
  - open conversations
  - failed sends
  - delivery/read tracking
- Add explicit support for:
  - manual handoff release
  - cancellation workflow
  - reschedule workflow
  - reminder workflow
- Add real metrics for:
  - inbound messages
  - replies sent
  - slots offered
  - reservations created
  - payments completed
  - handoffs
- Add end-to-end tests for:
  - inbound webhook
  - duplicate webhook delivery
  - slot reservation expiry
  - Stripe payment confirmation

## Known Technical Debt

- `npm run lint` still fails due to pre-existing issues unrelated to this WhatsApp work:
  - `src/components/landing/AnimatedLanding.tsx`
  - `src/lib/auth-config.ts`
- No admin UI exists yet for editing clinic WhatsApp settings safely in production.
- The current clinic and doctor chosen for WhatsApp are based on seeded data, not a curated production clinic setup.

## Useful Commands

### Deploy production

```bash
vercel deploy --prod
```

### Check production env names

```bash
vercel env ls
```

### Check Prisma migration state

```bash
npx prisma migrate status
```

### Test cron endpoint manually

```bash
curl -i -H "Authorization: Bearer <CRON_SECRET>" \
https://plexusmd.xyz/api/cron/expire-whatsapp-reservations
```

### Check production logs

```bash
vercel logs plexusmd.xyz
```

## Files Changed In This Work

- `prisma/schema.prisma`
- `prisma/migrations/20260514120000_whatsapp_market_ready/migration.sql`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/cron/expire-whatsapp-reservations/route.ts`
- `src/lib/whatsapp-webhook.ts`
- `src/lib/whatsapp.ts`
- `src/lib/payments.ts`
- `src/lib/google-calendar.ts`
- `tests/whatsapp-webhook.test.cjs`
- `tests/whatsapp-conversation-eval.cjs`
- `vercel.json`
