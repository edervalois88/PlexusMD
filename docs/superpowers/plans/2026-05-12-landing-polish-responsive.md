# Pulido Responsive Agenda 5-Etapas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalizar la adaptación responsive y el pulido final de la Agenda 5-Etapas en `src/components/landing/AnimatedLanding.tsx`.

**Architecture:** Asegurar flujo vertical natural en móvil (isMobile) y scrollytelling en escritorio (lg+). Ajustar colores y espaciado.

**Tech Stack:** React, Framer Motion, Tailwind CSS.

---

### Task 1: Ajustes de Colores y Visibilidad en Móvil

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Corregir colores de texto en Paso 5 para móvil**
En móvil el fondo es blanco, pero el Paso 5 usa texto blanco. Cambiar a slate-900.

- [ ] **Step 2: Ajustar `overflow-hidden` y alturas**
Asegurar que el contenedor no corte contenido en móvil.

- [ ] **Step 3: Limpiar variables redundantes**
Verificar si hay `useTransform` o variables de estado que no se usen.

### Task 2: Verificación y Lint

- [ ] **Step 1: Ejecutar lint**
Run: `npm run lint`
Confirmar que no hay errores nuevos en `AnimatedLanding.tsx`.

- [ ] **Step 2: Revisión manual de código**
Asegurar consistencia en los condicionales `isMobile`.
