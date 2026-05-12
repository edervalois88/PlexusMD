# Scrollytelling Stages 4-5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement visual stages 4 and 5 of the scrollytelling agenda and add micro-animations for cards 2, 4, and 5.

**Architecture:** Extend the existing `AnimatedLanding` component with new Framer Motion transforms and UI cards, ensuring they are synchronized with the `agendaProgress`.

**Tech Stack:** React, Next.js, Framer Motion, Tailwind CSS, Lucide React.

---

### Task 1: Update Imports and Transforms

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Add CheckCheck and Activity to imports**

```tsx
import { 
  ArrowRight, ShieldCheck, Sparkles, BrainCircuit, ChevronRight, 
  Calendar, MessageSquare, CheckCircle2, CheckCheck, Activity 
} from "lucide-react";
```

- [ ] **Step 2: Add Y Transforms for Cards 4 and 5**

```tsx
  // Agenda Cards Transforms
  const card1Y = useTransform(agendaProgress, [0, 0.18, 0.22], ["0%", "0%", "-120%"]);
  const card2Y = useTransform(agendaProgress, [0.18, 0.22, 0.38, 0.42], ["120%", "0%", "0%", "-120%"]);
  const card3Y = useTransform(agendaProgress, [0.38, 0.42, 0.58, 0.62], ["120%", "0%", "0%", "-120%"]);
  const card4Y = useTransform(agendaProgress, [0.58, 0.62, 0.78, 0.82], ["120%", "0%", "0%", "-120%"]);
  const card5Y = useTransform(agendaProgress, [0.78, 0.82], ["120%", "0%"]);
```

- [ ] **Step 3: Add Micro-animations Transforms**

```tsx
  // Micro-animations
  const shieldPulse = useTransform(agendaProgress, [0.25, 0.3, 0.35], [1, 1.3, 1]);
  const checkColor = useTransform(agendaProgress, [0.7, 0.75], ["#94a3b8", "#3b82f6"]);
  const scanlineOpacity = useTransform(agendaProgress, [0.8, 0.82], [0, 1]);
```

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): add transforms for cards 4-5 and micro-animations"
```

---

### Task 2: Implement Card 4 (WhatsApp Confirmation)

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Add Card 4 UI after Card 3**

```tsx
                {/* Card 4: WhatsApp Confirmación */}
                <motion.div 
                  style={{ y: isMobile ? 0 : card4Y }}
                  className="relative lg:absolute lg:inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare size={40} className="text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">¡Cita Confirmada!</h3>
                  <p className="text-slate-500 mb-8">Hemos enviado los detalles a tu WhatsApp.</p>
                  
                  <div className="bg-teal-500 text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-teal-500/20">
                    <div className="font-bold text-sm">Notificación Enviada</div>
                    <motion.div style={{ color: checkColor }}>
                      <CheckCheck size={20} />
                    </motion.div>
                  </div>
                </motion.div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): implement WhatsApp confirmation card"
```

---

### Task 3: Implement Card 5 (Side Doctor Preview)

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Add Card 5 UI after Card 4**

```tsx
                {/* Card 5: Side Doctor Preview */}
                <motion.div 
                  style={{ y: isMobile ? 0 : card5Y }}
                  className="relative lg:absolute lg:inset-0 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-8 flex flex-col overflow-hidden"
                >
                  {/* Scanline */}
                  <motion.div 
                    style={{ opacity: scanlineOpacity }}
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-px bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,1)] z-10"
                  />

                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
                      <BrainCircuit size={24} />
                    </div>
                    <div className="font-bold text-white">Side Doctor AI</div>
                  </div>

                  <div className="space-y-6 relative z-0">
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5" />
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-slate-700 rounded-full mb-2" />
                        <div className="h-2 w-full bg-slate-800 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <div className="flex-1">
                        <div className="h-2 w-32 bg-slate-700 rounded-full mb-2" />
                        <div className="h-2 w-4/5 bg-slate-800 rounded-full" />
                      </div>
                    </div>
                    
                    <div className="mt-12 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2 text-teal-400">
                        <Activity size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Analizando Historial...</span>
                      </div>
                      <div className="text-sm text-slate-300 italic">
                        &quot;Detectado patrón de adherencia positiva. Sugerir mantenimiento de dosis.&quot;
                      </div>
                    </div>
                  </div>
                </motion.div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): implement Side Doctor preview card with scanline"
```

---

### Task 4: Sync Micro-animations for Card 2

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Apply shieldPulse to Card 2 ShieldCheck**

```tsx
                {/* Card 2: Pago Seguro */}
                <motion.div 
                  style={{ y: isMobile ? 0 : card2Y }}
                  className="relative lg:absolute lg:inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col justify-center"
                >
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <motion.div style={{ scale: shieldPulse }}>
                        <ShieldCheck size={16} className="text-teal-600" />
                      </motion.div>
                      <span className="text-xs font-bold uppercase tracking-wider">Checkout Seguro</span>
                    </div>
// ...
```

- [ ] **Step 2: Run verification and Commit**

```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): sync shield pulse micro-animation"
```
