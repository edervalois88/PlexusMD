# Responsive y Verificación de Landing Page Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que la sección de Agenda sea responsiva y pulir detalles visuales.

**Architecture:** Ajustar clases de Tailwind para activar scrollytelling solo en pantallas grandes (lg) y proporcionar un flujo vertical natural en móviles.

**Tech Stack:** React, Tailwind CSS, Framer Motion.

---

### Task 1: Ajustar Contenedores de Agenda para Responsividad

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Modificar el contenedor principal de la sección Agenda**
    Cambiar `h-[300vh]` por `h-auto lg:h-[300vh]`.
- [ ] **Step 2: Modificar el contenedor sticky**
    Cambiar `sticky top-0 h-screen w-full flex items-center overflow-hidden` por `lg:sticky lg:top-0 lg:h-screen w-full flex items-center overflow-hidden lg:overflow-hidden h-auto py-20 lg:py-0`.
- [ ] **Step 3: Ajustar el Grid y el orden de las columnas**
    Cambiar el grid para que sea una sola columna en móvil y dos en escritorio.

### Task 2: Ajustar Tarjetas y Textos para Móvil

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Hacer que las tarjetas sean relativas y visibles en móvil**
    Cambiar las clases `absolute inset-0` por `relative lg:absolute lg:inset-0` en las 3 tarjetas de la agenda.
- [ ] **Step 2: Desactivar o mitigar transformaciones de Framer Motion en móvil**
    Usar una variante o condicional para que `y` solo se aplique en `lg`.
- [ ] **Step 3: Hacer que los bloques de texto sean relativos y visibles en móvil**
    Cambiar las clases `absolute inset-0` por `relative lg:absolute lg:inset-0` en los 3 bloques de texto.
- [ ] **Step 4: Ajustar espaciado entre bloques en móvil**
    Añadir `gap-20` al contenedor de texto en móvil.

### Task 3: Verificación y Pulido Final

- [ ] **Step 1: Verificar transiciones en escritorio**
    Asegurar que no haya saltos visuales.
- [ ] **Step 2: Ejecutar linting**
    Corregir cualquier error de linting.

### Task 4: Commit de Cambios

- [ ] **Step 1: Commit**
    `fix: adjust agenda scrollytelling for mobile and final polish`
