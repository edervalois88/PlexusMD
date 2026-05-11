# Spec: Unificación de Capa de Datos y Auditoría Automática

**Fecha:** 2026-05-09
**Proyecto:** PlexusMD
**Estado:** Design Approved

## 1. Objetivo
Unificar la capa de acceso a datos utilizando únicamente Prisma, optimizar el rendimiento para Vercel y garantizar que el 100% de las mutaciones de datos sean auditadas automáticamente.

## 2. Arquitectura de Datos

### 2.1 ORM Único (Prisma)
- **Acción:** Eliminar `typeorm` y `reflect-metadata` del proyecto.
- **Acción:** Borrar `src/lib/data-source.ts` y las entidades relacionadas.
- **Acción:** Eliminar los repositorios manuales en `src/lib/repositories/`.
- **Razón:** Reducir la sobrecarga de memoria, simplificar el mantenimiento y mejorar los tiempos de respuesta en funciones serverless de Vercel.

### 2.2 Auditoría Automática (Prisma Client Extensions)
- **Implementación:** Extender el cliente de Prisma en `src/lib/prisma.ts` utilizando el componente `$extends`.
- **Lógica:** Capturar eventos `create`, `update`, `delete`, `upsert`, `createMany`, `updateMany`, `deleteMany`.
- **Destino:** Cada operación generará un registro en la tabla `AuditLog` antes o después de la ejecución exitosa.
- **Seguridad:** Al estar en el cliente, ninguna mutación realizada a través de la aplicación quedará sin registro, cumpliendo con estándares de integridad médica.

## 3. Optimización para Vercel
- **Base de Datos:** Configurar el `PrismaClient` para usar el Pool de conexiones optimizado (ya iniciado con `@prisma/adapter-pg`).
- **KV Store:** Implementar `@vercel/kv` para:
    - Rate limiting de la API de Gemini (AI Insights).
    - Caché temporal de configuraciones de organización para evitar hits innecesarios a la DB.

## 4. Estándares de Código
- **Server Actions:** Toda la lógica de negocio residirá en `src/actions/`, usando el cliente unificado de Prisma.
- **Validación:** Uso estricto de `zod` para sanitizar entradas antes de interactuar con Prisma.

## 5. Plan de Validación
- **Tests E2E:** Verificar que al crear una cita, se genere automáticamente el AuditLog correspondiente.
- **Performance:** Monitorear los logs de Vercel para confirmar la reducción en los tiempos de "Cold Start".
