# Landing Page Enhancements (Tarea 28) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-taks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enriquecer la landing page con módulos de IA ("Side Doctor"), Agenda Autónoma y cumplimiento legal, utilizando animaciones "Ultra-Smooth" de Framer Motion.

**Architecture:** Modificación quirúrgica de `src/components/landing/AnimatedLanding.tsx` para insertar las nuevas secciones. Se utilizarán hooks de Framer Motion (`useScroll`, `useTransform`, `whileInView`) para los efectos sticky y parallax.

**Tech Stack:** Next.js 16, Tailwind CSS, Framer Motion, Lucide React.

---

### Task 1: Preparación y Estructura Base

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Limpiar secciones redundantes o preparar inserción**
Reemplazar la sección actual de "Side Doctor" y "Compliance" por los nuevos contenedores estructurados para parallax.

- [ ] **Step 2: Commit inicial de estructura**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "chore: prepare landing structure for enhancements"
```

### Task 2: Implementación Módulo "Side Doctor" (IA Validation)

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Crear el componente de Receta con Escáner**
Insertar el visual de la receta médica con el láser de escaneo infinito y el pulso teal.

```tsx
// Dentro de AnimatedLanding.tsx, nueva sección Side Doctor
<section className="relative py-40 bg-slate-950 text-white overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-start">
    {/* Columna Texto Sticky */}
    <div className="lg:sticky lg:top-32 h-fit">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ margin: "-100px" }}>
        <span className="text-teal-400 font-bold tracking-widest uppercase text-sm">Seguridad Clínica Elevada</span>
        <h2 className="text-5xl lg:text-7xl font-black mt-4 leading-tight">Validación Clínica Inteligente</h2>
        <p className="mt-8 text-slate-400 text-xl leading-relaxed">Detección proactiva de riesgos y ahorro de tiempo mediante el escaneo automatizado contra Vademécum actualizado.</p>
      </motion.div>
    </div>

    {/* Columna Visual (Receta) */}
    <div className="relative flex justify-center py-10">
      <motion.div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-slate-800 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
      >
        {/* Línea de Escaneo */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.8)] z-20"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Contenido Receta */}
        <div className="border-b-2 border-slate-100 pb-6 mb-6">
          <div className="h-5 w-32 bg-slate-200 rounded-full mb-3" />
          <div className="h-3 w-20 bg-slate-100 rounded-full" />
        </div>
        
        <div className="space-y-6">
          <div className="h-4 w-full bg-slate-50 rounded-full" />
          <div className="h-4 w-5/6 bg-slate-50 rounded-full" />
          
          {/* Medicamento con Glow */}
          <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl relative">
            <div className="h-4 w-40 bg-teal-200 rounded-full mb-2" />
            <div className="h-3 w-48 bg-teal-100 rounded-full" />
            <motion.div 
              className="absolute inset-0 border-2 border-teal-400 rounded-2xl"
              animate={{ opacity: [0, 1, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Alerta de Interacción */}
          <motion.div 
            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl shadow-xl flex gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">!</div>
            <div>
              <p className="text-xs font-black text-rose-900 uppercase tracking-tighter">Interacción Crítica</p>
              <p className="text-[11px] text-rose-700 font-medium">Riesgo detectado con Vademécum.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit Módulo IA**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat: add Side Doctor clinical validation module with animations"
```

### Task 3: Implementación Módulo "Agenda Autónoma" (Timeline)

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Crear la sección de Timeline con efecto Sticky**

```tsx
<section className="relative py-40 bg-white overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-start">
    {/* Visual Columna (Timeline) */}
    <div className="relative order-2 lg:order-1 flex justify-center">
      <div className="space-y-16 relative">
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100" />
        
        {[
          { step: "1", title: "Cita Agendada", desc: "Paciente reserva desde su móvil." },
          { step: "2", title: "Recordatorio WhatsApp", desc: "Enviado automáticamente 24h antes." },
          { step: "3", title: "Confirmación Recibida", desc: "Estado actualizado en el dashboard." }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            className="flex gap-10 items-start group"
            initial={{ opacity: 0.2, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-2xl z-10 font-black text-xl">
              {item.step}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-950">{item.title}</h4>
              <p className="text-slate-500 text-lg mt-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Texto Columna Sticky */}
    <div className="lg:sticky lg:top-32 h-fit lg:order-2">
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ margin: "-100px" }}>
        <span className="text-teal-600 font-bold tracking-widest uppercase text-sm">Operación 24/7</span>
        <h2 className="text-5xl lg:text-7xl font-black mt-4 leading-tight text-slate-900">Agenda Autónoma</h2>
        <p className="mt-8 text-slate-500 text-xl leading-relaxed">Sin recepcionistas, sin errores. PlexusMD gestiona la disponibilidad y confirma cada cita automáticamente.</p>
      </motion.div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit Módulo Agenda**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat: add Autonomous Agenda module with scroll-active timeline"
```

### Task 4: Compliance Footer y Pulido Final

**Files:**
- Modify: `src/components/landing/AnimatedLanding.tsx`

- [ ] **Step 1: Actualizar el Footer con nota legal elegante**

```tsx
<footer className="py-24 bg-slate-50 border-t border-slate-200">
  <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-12">
    <div className="flex items-center gap-3 text-slate-900 font-black text-2xl tracking-tighter">
      <div className="bg-slate-900 p-2 rounded-xl text-teal-400">
        <Sparkles size={20} strokeWidth={2.5} />
      </div>
      PlexusMD <span className="text-teal-600 font-light">Elite</span>
    </div>
    
    <div className="max-w-xl">
      <p className="text-[11px] uppercase font-bold text-slate-400 tracking-[0.2em] mb-4">Certificación y Estándares</p>
      <p className="text-sm text-slate-500 leading-relaxed italic">
        PlexusMD opera bajo el cumplimiento estricto de las políticas de <strong className="text-slate-700">WhatsApp Business de Meta</strong> y la protección de datos personales bajo estándares internacionales de seguridad (GDPR/HIPAA compliant design). Todas las comunicaciones se basan en consentimiento explícito (Opt-in).
      </p>
    </div>
  </div>
  <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-400 font-medium">
    <p>© {new Date().getFullYear()} PlexusMD. Todos los derechos reservados.</p>
    <Link href="/politica-whatsapp" className="hover:text-teal-600 transition-colors font-bold">Política de Mensajería</Link>
  </div>
</footer>
```

- [ ] **Step 2: Verificar Responsive y Performance**
Asegurar que las animaciones no bloqueen la navegación en móviles.

- [ ] **Step 3: Commit Final**
```bash
git add src/components/landing/AnimatedLanding.tsx
git commit -m "feat: complete landing enhancements with compliance footer"
```
