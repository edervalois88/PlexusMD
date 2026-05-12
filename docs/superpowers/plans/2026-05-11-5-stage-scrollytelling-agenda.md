# 5-Stage Scrollytelling Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconfigure the scrollytelling infrastructure in `AnimatedLanding.tsx` to support 5 distinct clinical stages with dynamic background and non-overlapping text visibility.

**Architecture:** Use Framer Motion's `useTransform` to map `agendaProgress` to 5 non-overlapping opacity/Y ranges and a multi-step background color transition. The container height is expanded to provide enough "scroll runway" for 5 stages.

**Tech Stack:** React, Framer Motion, Tailwind CSS, Lucide React.

---

### Task 1: Expand Container and Define Background Transform

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Increase agenda container height**
Change the section height from `lg:h-[300vh]` to `lg:h-[500vh]`.

- [ ] **Step 2: Define `agendaBg` useTransform**
Add the background color mapping for 5 stages.
```tsx
  const agendaBg = useTransform(
    agendaProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    ["#ffffff", "#f8fafc", "#f0fdfa", "#eff6ff", "#0f172a", "#0f172a"]
  );
```

- [ ] **Step 3: Apply `agendaBg` to the sticky container**
Ensure the sticky div within the agenda section uses this dynamic color.

### Task 2: Define 5-Stage Text Visibility Ranges

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Update text opacity transforms**
Define 5 distinct ranges with gaps to prevent overlaps.
```tsx
  // Stage 1: 0% - 15%
  const textOpacity1 = useTransform(agendaProgress, [0, 0.15, 0.18], [1, 1, 0]);
  // Stage 2: 20% - 35%
  const textOpacity2 = useTransform(agendaProgress, [0.17, 0.2, 0.35, 0.38], [0, 1, 1, 0]);
  // Stage 3: 40% - 55%
  const textOpacity3 = useTransform(agendaProgress, [0.37, 0.4, 0.55, 0.58], [0, 1, 1, 0]);
  // Stage 4: 60% - 75%
  const textOpacity4 = useTransform(agendaProgress, [0.57, 0.6, 0.75, 0.78], [0, 1, 1, 0]);
  // Stage 5: 80% - 100%
  const textOpacity5 = useTransform(agendaProgress, [0.77, 0.8, 1], [0, 1, 1]);
```

- [ ] **Step 2: Update text Y-axis transforms**
Match the opacity ranges for smooth entrance/exit.
```tsx
  const textY1 = useTransform(agendaProgress, [0, 0.15, 0.18], [0, 0, -20]);
  const textY2 = useTransform(agendaProgress, [0.17, 0.2, 0.35, 0.38], [20, 0, 0, -20]);
  const textY3 = useTransform(agendaProgress, [0.37, 0.4, 0.55, 0.58], [20, 0, 0, -20]);
  const textY4 = useTransform(agendaProgress, [0.57, 0.6, 0.75, 0.78], [20, 0, 0, -20]);
  const textY5 = useTransform(agendaProgress, [0.77, 0.8, 1], [20, 0, 0]);
```

### Task 3: Scaffold JSX for 5 Text Blocks

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Add new text block containers in the JSX**
Add containers for stages 4 and 5, using the new opacity/Y variables.

- [ ] **Step 2: Commit infrastructure changes**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "chore: expand agenda to 5-stage scrollytelling infrastructure"
```
