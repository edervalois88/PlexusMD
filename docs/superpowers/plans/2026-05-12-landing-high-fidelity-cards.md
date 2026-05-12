# Landing High-Fidelity Visuals (Stage 1-3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first 3 high-fidelity cards and fix scroll synchronization in `AnimatedLanding.tsx`.

**Architecture:** Update Framer Motion `useTransform` values for precise 20% scroll segments. Redesign static cards into interactive-looking components with WhatsApp bubbles, Stripe-style payments, and calendar animations.

**Tech Stack:** React, Next.js, Framer Motion, Lucide React, Tailwind CSS.

---

### Task 1: Fix Scroll Synchronization

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Update Card Transforms**
Redefine `card1Y`, `card2Y`, and `card3Y` to align with 20% scroll intervals.

```tsx
// Around line 41
const card1Y = useTransform(agendaProgress, [0, 0.18, 0.22], ["0%", "0%", "-120%"]);
const card2Y = useTransform(agendaProgress, [0.18, 0.22, 0.38, 0.42], ["120%", "0%", "0%", "-120%"]);
const card3Y = useTransform(agendaProgress, [0.38, 0.42, 0.58, 0.62], ["120%", "0%", "0%", "-120%"]);
```

- [ ] **Step 2: Verify alignment with text opacities**
Ensure text stages match these points (they currently use 0.15, 0.35, 0.55 etc., which is close enough for a start, but we can tighten them if needed).

- [ ] **Step 3: Commit sync changes**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "refactor(landing): align card transitions with 20% scroll segments"
```

### Task 2: Card 1 - WhatsApp Chatbot Visual

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Replace Card 1 content**
Design a real WhatsApp interface look with chat bubbles.

```tsx
{/* Card 1: WhatsApp Chatbot */}
<motion.div 
  style={{ y: isMobile ? 0 : card1Y }}
  className="relative lg:absolute lg:inset-0 bg-[#E5DDD5] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
>
  {/* WA Header */}
  <div className="bg-[#075E54] p-4 flex items-center gap-3">
    <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
      <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">P</div>
    </div>
    <div>
      <div className="text-white font-bold text-sm">PlexusMD Assistant</div>
      <div className="text-teal-100 text-[10px] flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> en línea
      </div>
    </div>
  </div>

  {/* Chat Area */}
  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
    {/* Incoming message */}
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      className="max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800"
    >
      ¡Hola! Soy tu asistente. ¿Deseas agendar una cita?
    </motion.div>
    
    {/* Outgoing message */}
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="max-w-[80%] bg-[#DCF8C6] p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-slate-800 ml-auto"
    >
      Sí, por favor. Para mañana a las 10am.
    </motion.div>

    {/* Incoming confirmation */}
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
      className="max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800"
    >
      Perfecto. Recibirás un link de pago seguro en un momento.
    </motion.div>
  </div>
</motion.div>
```

- [ ] **Step 2: Commit Card 1**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): implement WhatsApp Chatbot high-fidelity card"
```

### Task 3: Card 2 - Secure Payment Visual

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Replace Card 2 content**
Design a "Stripe style" payment link or card.

```tsx
{/* Card 2: Pago Seguro */}
<motion.div 
  style={{ y: isMobile ? 0 : card2Y }}
  className="relative lg:absolute lg:inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col justify-center"
>
  <div className="mb-8">
    <div className="flex items-center gap-2 text-slate-400 mb-2">
      <ShieldCheck size={16} className="text-teal-600" />
      <span className="text-xs font-bold uppercase tracking-wider">Checkout Seguro</span>
    </div>
    <div className="text-2xl font-black text-slate-900">Consulta Especialista</div>
    <div className="text-3xl font-black text-teal-600 mt-1">$450.00 <span className="text-sm text-slate-400">MXN</span></div>
  </div>

  <div className="space-y-4">
    <div className="p-4 border-2 border-slate-100 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
        <div className="text-sm font-bold text-slate-600">•••• 4242</div>
      </div>
      <CheckCircle2 size={18} className="text-teal-600" />
    </div>
    
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite]" />
      Pagar Ahora
      <ArrowRight size={18} />
    </motion.button>
  </div>
</motion.div>
```

- [ ] **Step 2: Commit Card 2**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): implement Secure Payment high-fidelity card"
```

### Task 4: Card 3 - Synchronization Visual

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Replace Card 3 content**
Design a calendar grid that updates dynamically.

```tsx
{/* Card 3: Sincronización */}
<motion.div 
  style={{ y: isMobile ? 0 : card3Y }}
  className="relative lg:absolute lg:inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col"
>
  <div className="flex justify-between items-center mb-6">
    <div className="font-black text-slate-900">Agenda Médica</div>
    <div className="flex gap-1">
      <div className="w-2 h-2 rounded-full bg-teal-500" />
      <div className="w-2 h-2 rounded-full bg-blue-500" />
    </div>
  </div>

  <div className="grid grid-cols-7 gap-1.5 mb-8">
    {Array.from({ length: 35 }).map((_, i) => (
      <div key={i} className="aspect-square bg-slate-50 rounded-md relative flex items-center justify-center">
        {i === 17 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="absolute inset-0 bg-teal-500 rounded-md shadow-lg shadow-teal-500/30 flex items-center justify-center"
          >
            <CheckCircle2 size={12} className="text-white" />
          </motion.div>
        )}
        <span className="text-[8px] font-bold text-slate-300">{i + 1}</span>
      </div>
    ))}
  </div>

  <div className="mt-auto space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
        <Calendar size={14} />
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronización</div>
        <div className="text-xs font-bold text-slate-700">Google Calendar Link</div>
      </div>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 1.5 }}
        className="h-full bg-teal-500" 
      />
    </div>
  </div>
</motion.div>
```

- [ ] **Step 2: Commit Card 3**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat(landing): implement Sync high-fidelity card"
```

---

## Verification Plan

- [ ] **Visual Check:** Scroll through the agenda section.
- [ ] **Sync Check:** Confirm that cards change exactly when the text description to the right changes (at 20%, 40%, 60% scroll).
- [ ] **Mobile Check:** Ensure cards stack correctly on mobile (should be static/stacked as per `isMobile` logic).
- [ ] **Component Integrity:** Run `npm run lint` or `tsc` to ensure no TypeScript errors were introduced.
