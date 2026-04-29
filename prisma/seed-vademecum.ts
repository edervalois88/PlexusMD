import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL is required to run the vademecum seed.");
}

const pool = new Pool({
  connectionString,
  max: Number(process.env.POSTGRES_POOL_MAX ?? 5),
  idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT_MS ?? 10_000),
  connectionTimeoutMillis: Number(process.env.POSTGRES_CONNECTION_TIMEOUT_MS ?? 5_000),
  allowExitOnIdle: true,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const medications = [
  {
    name: "Metformina",
    common_dose: "500-850 mg cada 12 h con alimentos",
    warnings: ["Trastorno gastrointestinal", "Riesgo de acidosis láctica en insuficiencia renal"],
    legal_notes: "Uso con receta. Verificar función renal y registro clínico conforme a NOM-004-SSA3-2012.",
  },
  {
    name: "Losartán",
    common_dose: "50 mg cada 24 h",
    warnings: ["Hipotensión", "Embarazo", "Deshidratación"],
    legal_notes: "Uso con receta. Documentar motivo clínico y seguimiento de presión arterial.",
  },
  {
    name: "Amlodipino",
    common_dose: "5 mg cada 24 h",
    warnings: ["Edema periférico", "Hipotensión"],
    legal_notes: "Uso con receta. Registrar metas de presión arterial y vigilancia de efectos adversos.",
  },
  {
    name: "Atorvastatina",
    common_dose: "10-20 mg cada 24 h por la noche",
    warnings: ["Miopatía", "Hepatopatía", "Interacciones con inhibidores CYP3A4"],
    legal_notes: "Uso con receta. Registrar perfil de lípidos y educación sobre síntomas musculares.",
  },
  {
    name: "Aspirina Protect",
    common_dose: "100 mg cada 24 h con alimentos",
    warnings: ["Sangrado gastrointestinal", "Alergia a AINEs"],
    legal_notes: "Uso con receta. Verificar riesgo hemorrágico y antecedentes alérgicos antes de indicar.",
  },
  {
    name: "Paracetamol",
    common_dose: "500-1000 mg cada 8 h",
    warnings: ["Hepatotoxicidad a dosis altas"],
    legal_notes: "Uso con receta. Evitar exceder dosis máxima diaria y documentar indicación.",
  },
  {
    name: "Ibuprofeno",
    common_dose: "400 mg cada 8 h con alimentos",
    warnings: ["Gastritis", "Insuficiencia renal", "Alergia a AINEs"],
    legal_notes: "Uso con receta. Registrar alergias a AINEs y riesgo gastrointestinal.",
  },
  {
    name: "Omeprazol",
    common_dose: "20 mg cada 24 h antes del desayuno",
    warnings: ["Uso prolongado", "Hipomagnesemia"],
    legal_notes: "Uso con receta. Documentar duración prevista y motivo clínico.",
  },
  {
    name: "Amoxicilina",
    common_dose: "500 mg cada 8 h",
    warnings: ["Alergia a penicilinas"],
    legal_notes: "Uso con receta. Confirmar alergia a betalactamicos y documentar el foco infeccioso.",
  },
  {
    name: "Cefalexina",
    common_dose: "500 mg cada 6-8 h",
    warnings: ["Alergia a cefalosporinas", "Alergia cruzada con penicilinas"],
    legal_notes: "Uso con receta. Registrar antecedentes de alergia y diagnóstico presuntivo.",
  },
  {
    name: "Diclofenaco",
    common_dose: "50 mg cada 8-12 h",
    warnings: ["Riesgo gastrointestinal", "Riesgo cardiovascular", "Alergia a AINEs"],
    legal_notes: "Uso con receta. Registrar riesgo GI/CV y antecedentes de alergia antes de indicar.",
  },
  {
    name: "Furosemida",
    common_dose: "20-40 mg cada 24 h",
    warnings: ["Hipovolemia", "Hipokalemia", "Deshidratación"],
    legal_notes: "Uso con receta. Vigilar electrolitos, función renal y balance hídrico.",
  },
  {
    name: "Enalapril",
    common_dose: "5-10 mg cada 12-24 h",
    warnings: ["Tos", "Hiperkalemia", "Embarazo"],
    legal_notes: "Uso con receta. Registrar función renal, potasio y advertencias de embarazo.",
  },
  {
    name: "Sertralina",
    common_dose: "50 mg cada 24 h",
    warnings: ["Síndrome serotoninérgico", "Náusea", "Insomnio"],
    legal_notes: "Uso con receta. Documentar seguimiento clínico y riesgo de interacciones serotoninérgicas.",
  },
  {
    name: "Levotiroxina",
    common_dose: "25-100 mcg cada 24 h en ayuno",
    warnings: ["Sobredosificación", "Palpitaciones"],
    legal_notes: "Uso con receta. Registrar TSH/T4 y educación sobre administración en ayuno.",
  },
  {
    name: "Metoprolol",
    common_dose: "50 mg cada 12-24 h",
    warnings: ["Bradicardia", "Hipotensión", "Asma no controlada"],
    legal_notes: "Uso con receta. Vigilar frecuencia cardiaca y comorbilidad respiratoria.",
  },
  {
    name: "Loratadina",
    common_dose: "10 mg cada 24 h",
    warnings: ["Somnolencia leve", "Interacciones poco frecuentes"],
    legal_notes: "Uso con receta. Registrar indicación y duración del tratamiento.",
  },
  {
    name: "Salbutamol",
    common_dose: "100 mcg por inhalación cada 4-6 h PRN",
    warnings: ["Taquicardia", "Temblor"],
    legal_notes: "Uso con receta. Documentar técnica de inhalación y frecuencia de rescate.",
  },
  {
    name: "Ciprofloxacino",
    common_dose: "500 mg cada 12 h",
    warnings: ["Tendinopatía", "QT prolongado", "Interacciones"],
    legal_notes: "Uso con receta. Reservar para indicaciones apropiadas y registrar advertencias de seguridad.",
  },
  {
    name: "Budesonida/Formoterol",
    common_dose: "1-2 inhalaciones cada 12 h",
    warnings: ["Taquicardia", "Candidiasis oral"],
    legal_notes: "Uso con receta. Registrar control de asma/EPOC y educación sobre enjuague oral.",
  },
] as const;

async function main() {
  for (const medication of medications) {
    await prisma.medication.upsert({
      where: {
        name: medication.name,
      },
      create: {
        name: medication.name,
        common_dose: medication.common_dose,
        warnings: medication.warnings,
        legal_notes: medication.legal_notes,
        is_active: true,
      },
      update: {
        common_dose: medication.common_dose,
        warnings: medication.warnings,
        legal_notes: medication.legal_notes,
        is_active: true,
      },
    });
  }

  console.log(`Seeded ${medications.length} medications.`);
}

main()
  .catch((error) => {
    console.error("Error seeding vademecum:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
