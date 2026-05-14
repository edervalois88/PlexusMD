/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");

const { detectConversationIntent } = require("../src/lib/whatsapp-webhook.ts");

const cases = [
  ["hola, quiero una cita", "ASK_AVAILABILITY"],
  ["hay horario para consulta?", "ASK_AVAILABILITY"],
  ["quiero reagendar mi cita", "RESCHEDULE"],
  ["necesito cancelar", "CANCEL"],
  ["me atiende una persona?", "HUMAN_HANDOFF"],
  ["esto es una emergencia", "HUMAN_HANDOFF"],
  ["BAJA", "OPT_OUT"],
  ["stop", "OPT_OUT"],
  ["ALTA", "OPT_IN"],
];

test("WhatsApp intent evaluation baseline", () => {
  const failures = cases
    .map(([utterance, expected]) => {
      const actual = detectConversationIntent(utterance).type;
      return actual === expected ? null : { utterance, expected, actual };
    })
    .filter(Boolean);

  assert.deepEqual(failures, []);
});
