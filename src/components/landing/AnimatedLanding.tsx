"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, LogIn, ShieldCheck, Sparkles, MessageSquare, BrainCircuit, Users, CheckCircle2, ChevronRight, Smartphone, Activity, Stethoscope } from "lucide-react";
import { useRef } from "react";

export function AnimatedLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
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
                    "Sugiero revisar los niveles de glucosa basados en el historial reciente del paciente."
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

      {/* Side Doctor Section */}
      <section className="relative z-20 py-32 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-400 text-sm font-bold mb-8 border border-teal-500/20">
                <BrainCircuit size={16} />
                Exclusivo de Elite
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                Conoce a tu <br/><span className="text-teal-400">Side Doctor.</span>
              </h2>
              <p className="text-xl text-slate-400 font-light leading-relaxed mb-8">
                No es solo un expediente. Es un asistente clínico impulsado por IA Generativa que analiza el contexto del paciente, sugiere preguntas clave y genera reportes de valor automáticamente durante la consulta.
              </p>
              <ul className="space-y-5">
                {[
                  "Análisis predictivo de historial clínico.",
                  "Generación automática de notas SOAP.",
                  "Detección de interacciones medicamentosas.",
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-300 font-medium text-lg">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-teal-400 border border-white/10">
                      <Activity size={16} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-blue-500/20 rounded-[3rem] blur-3xl -z-10"></div>
               <div className="bg-slate-800 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative z-10 backdrop-blur-xl">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                        <Stethoscope size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold">Análisis en tiempo real</h4>
                        <p className="text-xs text-slate-400">Paciente: Carlos R.</p>
                      </div>
                    </div>
                    <div className="text-xs bg-slate-700 px-3 py-1 rounded-full text-teal-400 font-mono">
                      Analizando...
                    </div>
                 </div>
                 <div className="space-y-4">
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                     <p className="text-sm text-slate-300 leading-relaxed">
                       Basado en los síntomas descritos de fatiga extrema y los laboratorios del mes pasado, el <strong className="text-teal-400">Side Doctor</strong> sugiere evaluar función tiroidea (TSH).
                     </p>
                   </div>
                   <div className="flex justify-end gap-3 pt-4">
                     <button className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Descartar</button>
                     <button className="text-sm font-semibold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Agregar a órdenes</button>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explicit Compliance Section (Preserved & Enhanced) */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-20 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold mb-8 border border-slate-200">
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
                    <p className="text-slate-500 mt-1">Los pacientes pueden detener los mensajes en milisegundos respondiendo "BAJA".</p>
                  </div>
                </div>
              </div>

              <Link href="/politica-whatsapp" className="group inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors">
                Leer Declaración de Cumplimiento
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-slate-50 p-1 rounded-[2.5rem] border border-slate-200 shadow-2xl relative z-10">
                <div className="bg-white rounded-[2.3rem] p-8 md:p-12">
                   <div className="space-y-6">
                      <div className="flex items-start gap-4 p-5 rounded-2xl bg-teal-50 border border-teal-100 mt-2">
                        <div className="w-5 h-5 rounded border-2 border-teal-600 bg-teal-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          Acepto explícitamente recibir recordatorios de citas vía WhatsApp. Comprendo la Política de Mensajería y sé que puedo enviar "BAJA" para detener las comunicaciones.
                        </p>
                      </div>
                      <div className="h-14 w-full bg-slate-900 rounded-xl mt-6 flex items-center justify-center text-white font-bold text-sm">
                        Confirmar y Agendar
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
             <div className="bg-slate-900 p-1.5 rounded-lg text-teal-400">
              <Sparkles size={16} strokeWidth={2.5} />
             </div>
             PlexusMD Elite
          </div>
          <div className="flex items-center gap-6">
            <Link href="/politica-whatsapp" className="text-sm text-slate-500 hover:text-teal-600 font-bold transition-colors">
              Política de WhatsApp Business
            </Link>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} PlexusMD. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
