# Unificación Prisma y Auditoría Automática Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar el acceso a datos en Prisma, eliminando TypeORM, y activar auditoría automática de mutaciones para mejorar la seguridad y el rendimiento en Vercel.

**Architecture:** Se utilizará un único cliente de Prisma extendido con `$extends` para interceptar todas las operaciones de escritura (create, update, delete) y persistirlas en la tabla `AuditLog`. Se eliminará la capa de repositorios de TypeORM en favor de Prisma y se optimizará el uso de servicios nativos de Vercel.

**Tech Stack:** Next.js 16, Prisma 7, PostgreSQL, @vercel/kv, Zod.

---

### Task 1: Limpieza de Dependencias y TypeORM [DONE]

**Files:**
- Modify: `package.json`
- Delete: `src/lib/data-source.ts`
- Delete: `src/lib/repositories/AppointmentRepository.ts`
- Delete: `src/lib/repositories/PatientRepository.ts`

- [x] **Step 1: Remover dependencias de TypeORM**
```json
// En package.json, eliminar:
// "reflect-metadata", "typeorm"
```
- [x] **Step 2: Ejecutar desinstalación y limpiar archivos**
Run: `npm uninstall typeorm reflect-metadata && rm src/lib/data-source.ts src/lib/repositories/AppointmentRepository.ts src/lib/repositories/PatientRepository.ts`

- [x] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: remove typeorm dependencies and repository files"
```

### Task 2: Configuración de Auditoría Automática en Prisma [DONE]

**Files:**
- Modify: `src/lib/prisma.ts`

- [x] **Step 1: Implementar la extensión de auditoría**
```typescript
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// ... (configuración de pool y adapter existente)

const basePrisma = new PrismaClient({ adapter, log: ['query'] });

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);

        const mutationOperations = ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'];
        
        if (mutationOperations.includes(operation) && model !== 'AuditLog') {
          // Nota: En un entorno real, obtendríamos el userId del contexto/session si fuera posible,
          // pero como extensión global, registramos la operación técnica.
          await basePrisma.auditLog.create({
            data: {
              action: `${model}.${operation}`,
              resource: model,
              payload: args as any,
              // userId: (se manejaría vía middleware o parámetro si es vital)
            }
          }).catch(err => console.error("Audit log failed", err));
        }
        
        return result;
      },
    },
  },
});
```
- [x] **Step 2: Verificar compilación**
Run: `npx tsc --noEmit`
Expected: SUCCESS

- [x] **Step 3: Commit**
```bash
git add src/lib/prisma.ts
git commit -m "feat: implement automatic auditing via prisma extension"
```

### Task 3: Refactorización de Acciones (Appointment) [DONE]

**Files:**
- Modify: `src/actions/appointment.ts`

- [x] **Step 1: Migrar `getDailyAppointmentsForTenant` a Prisma**
```typescript
export async function getDailyAppointmentsForTenant(tenantSlug: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.appointment.findMany({
      where: {
        organization: { slug: tenantSlug },
        start_time: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { start_time: 'asc' },
    });
  } catch (error) {
    // ... handling
  }
}
```
- [x] **Step 2: Limpiar imports de TypeORM y Repositorios**
- [x] **Step 3: Test manual/E2E**
Run: `npm run dev` y verificar la carga de la agenda.
- [x] **Step 4: Commit**
```bash
git add src/actions/appointment.ts
git commit -m "refactor: migrate appointment actions from typeorm to prisma"
```

### Task 4: Optimización Vercel KV para AI Insights [DONE]

**Files:**
- Modify: `src/actions/ai.ts`

- [x] **Step 1: Instalar @vercel/kv**
Run: `npm install @vercel/kv`
- [x] **Step 2: Implementar Rate Limiting con KV**
```typescript
import { kv } from "@vercel/kv";

export async function analyzePatientInsight(patientHistory: unknown, reason: string, organizationId: string) {
  const limitKey = `ai_limit:${organizationId}`;
  const usage = await kv.get<number>(limitKey) || 0;
  
  if (usage >= 100) { // Ejemplo: límite de 100 por día
    throw new Error("AI daily limit reached for this organization.");
  }

  // ... lógica existente de Gemini

  await kv.incr(limitKey);
  await kv.expire(limitKey, 86400); // 24h
  
  // ... resto del código
}
```
- [x] **Step 3: Commit**
```bash
git add src/actions/ai.ts
git commit -m "perf: add vercel kv rate limiting for ai insights"
```
