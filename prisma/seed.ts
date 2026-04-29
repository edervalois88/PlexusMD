import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Iniciando Seeding de Staging/Pruebas de Carga...');

  // Generar 10 Organizaciones (Clínicas)
  for (let i = 1; i <= 10; i++) {
    const orgName = faker.company.name();
    const slug = `clinica-${faker.string.alphanumeric(6).toLowerCase()}`;
    
    // Crear la organización
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug: slug,
        is_active: i !== 10, // La organización 10 estará suspendida para probar el Kill Switch
      },
    });

    console.log(`Creada Organización: ${org.name} (${org.slug})`);

    // Crear 5 Médicos (Users) por organización
    for (let j = 0; j < 5; j++) {
      await prisma.user.create({
        data: {
          email: faker.internet.email(),
          role: "DOCTOR",
          organization_id: org.id,
        },
      });
    }

    // Crear 50 Pacientes por organización
    for (let k = 0; k < 50; k++) {
      await prisma.patient.create({
        data: {
          organization_id: org.id,
          full_name: faker.person.fullName(),
          curp: faker.string.alphanumeric(18).toUpperCase(),
          birth_date: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
          medical_history_json: {
            conditions: [faker.helpers.arrayElement(["Diabetes", "Hipertensión", "Asma", "Ninguna", "Alergia"])],
            previousMeds: [],
          },
        },
      });
    }
    // Si es la organización 1, crear el "Paciente de Oro" para la demostración
    if (i === 1) {
      await prisma.patient.create({
        data: {
          organization_id: org.id,
          full_name: "Roberto Castañeda (Golden Patient)",
          curp: "CASR650423HDFXXXXX",
          birth_date: new Date("1965-04-23"),
          medical_history_json: {
            conditions: ["Diabetes Mellitus Tipo 2 (Diagnosticado hace 10 años)", "Hipertensión Arterial Sistémica", "Dislipidemia"],
            previousMeds: ["Metformina 850mg c/12h", "Losartán 50mg c/24h", "Atorvastatina 20mg c/24h", "Aspirina Protec 100mg c/24h"],
            allergies: ["Penicilina", "Ibuprofeno"],
            pastNotes: [
              { date: "2023-08-15", note: "Paciente con descontrol glucémico severo (HbA1c 9.5%)." },
              { date: "2023-11-02", note: "Ajuste de medicación. Agrega sitagliptina." }
            ]
          },
        },
      });
      console.log(`⭐ Paciente de Oro creado en la clínica: ${org.name}`);
    }

  }

  console.log('✅ Seeding completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
