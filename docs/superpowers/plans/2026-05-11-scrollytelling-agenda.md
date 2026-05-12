# Scrollytelling Autonomous Agenda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar la sección de Agenda Autónoma en una experiencia de Scrollytelling con tarjetas que se empujan y micro-animaciones controladas por scroll.

**Architecture:** Refactorización de la sección de agenda en `src/components/landing/AnimatedLanding.tsx`. Utilizaremos un contenedor de `300vh` con un layout sticky y `useScroll` para orquestar las transiciones de 3 tarjetas visuales.

**Tech Stack:** Next.js, Tailwind CSS, Framer Motion (useScroll, useTransform).

---

### Task 1: Infraestructura de Scroll y Layout Sticky

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Definir el contenedor de Scrollytelling**
Reemplazar la sección de Agenda actual por un contenedor de `300vh` y configurar el `ref` para `useScroll`.

```tsx
// Dentro de AnimatedLanding.tsx
const agendaRef = useRef<HTMLDivElement>(null);
const { scrollYProgress: agendaProgress } = useScroll({
  target: agendaRef,
  offset: ["start start", "end end"]
});
```

- [ ] **Step 2: Crear el esqueleto de 2 columnas Sticky**
La columna de texto debe ser sticky para permanecer visible durante el recorrido de las tarjetas.

- [ ] **Step 3: Commit infraestructura**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "chore: setup scrollytelling infrastructure for agenda"
```

### Task 2: Implementación de Tarjetas con Efecto "Push"

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Definir las transformaciones de posición**
Crear los hooks `useTransform` para la posición `y` de cada una de las 3 tarjetas.

```tsx
const card1Y = useTransform(agendaProgress, [0, 0.33, 0.4], ["0%", "0%", "-120%"]);
const card2Y = useTransform(agendaProgress, [0.3, 0.4, 0.66, 0.73], ["120%", "0%", "0%", "-120%"]);
const card3Y = useTransform(agendaProgress, [0.6, 0.73], ["120%", "0%"]);
```

- [ ] **Step 2: Maquetar las tarjetas visuales**
  - **Card 1 (Calendar):** Grid de 3x3 celdas, una celda con efecto pulse.
  - **Card 2 (WhatsApp):** Burbuja verde con icono de mensaje.
  - **Card 3 (Check):** Círculo grande con icono de validación.

- [ ] **Step 3: Commit tarjetas base**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat: implement agenda scrollytelling cards with push effect"
```

### Task 3: Micro-animaciones y Sincronización

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Vincular micro-animaciones al progreso**
Usar el `agendaProgress` para disparar animaciones internas (ej. `pathLength` del check o escala del pulse).

```tsx
const checkPath = useTransform(agendaProgress, [0.8, 0.95], [0, 1]);
const pulseScale = useTransform(agendaProgress, [0, 0.2], [1, 1.2]);
```

- [ ] **Step 2: Ajustar opacidad y escala de texto**
Hacer que el texto de la izquierda también reaccione sutilmente al cambio de tarjetas para mejorar la cohesión.

- [ ] **Step 3: Commit final Scrollytelling**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat: add micro-animations to agenda scrollytelling"
```

### Task 4: Responsive y Verificación

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Desactivar Scrollytelling en móvil**
Asegurar que en pantallas `< lg` las tarjetas se muestren en una lista normal para evitar scrolls infinitos confusos en móvil.

- [ ] **Step 2: Linting y validación visual**
Ejecutar lint y verificar que no haya saltos bruscos en las transiciones de 33% y 66%.

- [ ] **Step 3: Commit final**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "fix: adjust agenda scrollytelling for mobile and final polish"
```
