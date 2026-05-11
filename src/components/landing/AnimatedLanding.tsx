"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, BrainCircuit, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function AnimatedLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const agendaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: agendaProgress } = useScroll({
    target: agendaRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], ["0%", "40%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Liquid Animations Definitions
  const liquidStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const liquidReveal: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 20, 
        mass: 1.5 
      } 
    },
  };

  return (
    <div ref={containerRef} className="relative bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50 bg-[#F8FAFC]/80 backdrop-blur-2xl border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-900 font-black text-2xl tracking-tighter">
            <div className="bg-slate-900 p-2.5 rounded-xl text-teal-400">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            PlexusMD <span className="text-teal-600 font-light">Elite</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Ingresar
            </Link>
            <Link href="/registro" className="group relative inline-flex items-center justify-center text-sm font-bold bg-teal-600 text-white px-6 py-2.5 rounded-full overflow-hidden transition-all hover:bg-teal-700 shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 active:scale-95">
              <span className="relative z-10 flex items-center gap-2">
                Empezar
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Elite Hero Section with Glassmorphism iPhone */}
      <motion.section 
        style={{ y: yHero, opacity: opacityHero }}
        className="relative pt-40 pb-20 px-6 lg:px-8 max-w-7xl mx-auto min-h-[95vh] flex flex-col lg:flex-row items-center justify-between gap-12 origin-top"
      >
        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <motion.div 
          variants={liquidStagger}
          initial="hidden"
          animate="visible"
          className="flex-1 max-w-2xl z-10"
        >
          <motion.div variants={liquidReveal} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-teal-200/50 bg-white/60 px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur-md">
            <ShieldCheck size={18} className="text-teal-600" />
            <span>WA Business 100% Compliant</span>
          </motion.div>

          <motion.h1 variants={liquidReveal} className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-slate-900 tracking-tighter leading-[1.05]">
            Tu clínica,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
              en piloto automático.
            </span>
          </motion.h1>

          <motion.p variants={liquidReveal} className="mt-8 text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
            Agenda inteligente, reportes de valor y el revolucionario <strong className="text-slate-900">Side Doctor</strong>. Todo operando bajo estrictos estándares de privacidad.
          </motion.p>

          <motion.div variants={liquidReveal} className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link href="/registro" className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-1">
              Crear Tenant
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* iPhone Glassmorphism Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 10, rotateY: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4, delay: 0.2 }}
          className="flex-1 w-full max-w-md relative perspective-1000 z-10 hidden md:block"
        >
          <div className="relative w-[340px] h-[680px] mx-auto">
            {/* Phone Frame */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/40 shadow-[0_30px_100px_rgba(15,23,42,0.15)] overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
                <div className="w-32 h-7 bg-slate-900 rounded-b-3xl"></div>
              </div>
              
              {/* Screen Content */}
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-12 flex flex-col gap-4">
                {/* App Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Sparkles size={16} className="text-teal-600"/> PlexusMD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                </div>

                {/* Glass Card 1 */}
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Siguiente Cita</span>
                    <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">Confirmada</span>
                  </div>
                  <div className="font-bold text-lg text-slate-800">Ana Martínez</div>
                  <div className="text-sm text-slate-500">Hoy, 10:00 AM</div>
                </div>

                {/* Glass Card 2 (Side Doctor preview) */}
                <div className="bg-slate-900 p-4 rounded-2xl shadow-lg mt-auto mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
                      <BrainCircuit size={18} />
                    </div>
                    <span className="text-white font-bold text-sm">Side Doctor AI</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed relative z-10">
                    &quot;Sugiero revisar los niveles de glucosa basados en el historial reciente del paciente.&quot;
                  </p>
                </div>
              </div>
            </div>
            
            {/* Phone Highlights */}
            <div className="absolute inset-0 rounded-[3rem] border-2 border-white/50 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-x-8 -bottom-10 h-10 bg-slate-900/20 blur-xl rounded-full"></div>
          </div>
        </motion.div>
      </motion.section>

      {/* Side Doctor Section - IA Validation */}
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

      {/* Agenda Autónoma Module - Timeline Scrollytelling */}
      <section ref={agendaRef} className="relative h-[300vh] bg-white">
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-center w-full">
            {/* Visual Columna (Timeline) - Left */}
            <div className="relative order-2 lg:order-1 flex justify-center h-[500px] w-full items-center">
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
                    viewport={{ amount: 0.3 }}
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

            {/* Texto Columna Sticky - Right */}
            <div className="lg:order-2">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ margin: "-100px" }}>
                <span className="text-teal-600 font-bold tracking-widest uppercase text-sm">Operación 24/7</span>
                <h2 className="text-5xl lg:text-7xl font-black mt-4 leading-tight text-slate-900">Agenda Autónoma</h2>
                <p className="mt-8 text-slate-500 text-xl leading-relaxed">Sin recepcionistas, sin errores. PlexusMD gestiona la disponibilidad y confirma cada cita automáticamente.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Explicit Compliance Section - Enhanced with Sticky/Parallax Support */}
      <section className="relative bg-white py-20 lg:py-0 overflow-visible border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-20">
            {/* Right Column (Fixed Text on Scroll): Sticky Text */}
            <div className="w-full lg:w-1/2 lg:min-h-screen flex flex-col justify-center py-12 lg:py-24 lg:sticky lg:top-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold mb-8 border border-slate-200 w-fit">
                <ShieldCheck size={16} className="text-teal-600" />
                Cumplimiento WhatsApp Business
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight text-slate-900">
                Comunicación certificada. <br/> Cero zonas grises.
              </h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed mb-10">
                Garantizamos que todas las comunicaciones hacia pacientes provienen de un consentimiento explícito (Opt-In), protegiendo tu número y tu reputación.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100">
                    <span className="text-teal-600 font-black">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Opt-in Activo Obligatorio</h4>
                    <p className="text-slate-500 mt-1">Checkboxes desmarcados por defecto y textos legales claros en cada formulario.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100">
                    <span className="text-teal-600 font-black">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Baja Inmediata (Opt-out)</h4>
                    <p className="text-slate-500 mt-1">Los pacientes pueden detener los mensajes en milisegundos respondiendo &quot;BAJA&quot;.</p>
                  </div>
                </div>
              </div>

              <Link href="/politica-whatsapp" className="group inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors">
                Leer Declaración de Cumplimiento
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Left Column: Parallax Visuals Space */}
            <div className="w-full lg:w-1/2 relative py-12 lg:py-24 flex items-center justify-center min-h-[400px] lg:min-h-screen">
              {/* Content for parallax will be inserted here in next tasks */}
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
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
    </div>
  );
}
