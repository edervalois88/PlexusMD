import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Mensajería de WhatsApp Business | PlexusMD",
  description: "Conoce cómo PlexusMD cumple con las políticas de Meta y protege tus comunicaciones clínicas.",
};

export default function WhatsappPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-8 font-medium transition-colors font-semibold">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
            Cumplimiento y Política de WhatsApp Business
          </h1>
        </div>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Compromiso de Transparencia</h2>
            <p>
              En PlexusMD nos tomamos muy en serio la privacidad y la experiencia de usuario. Nuestra plataforma opera en estricto cumplimiento con la <strong>Política de Mensajes de WhatsApp Business</strong> de Meta. El objetivo es garantizar interacciones de alta calidad, seguras y deseadas por los usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Opt-in Explícito Obligatorio</h2>
            <p>
              Ningún paciente o médico recibirá mensajes a través de nuestra infraestructura sin haber proporcionado un <strong>consentimiento (Opt-in) explícito y verificable</strong>.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>El opt-in se obtiene a través de flujos claros en nuestra plataforma web.</li>
              <li>El usuario comprende exactamente qué tipo de mensajes recibirá (recordatorios de citas, notificaciones médicas, confirmaciones).</li>
              <li>Mantenemos un registro con el "timestamp" exacto del momento en que el usuario otorgó su permiso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Calidad de los Mensajes</h2>
            <p>
              Utilizamos la inteligencia artificial para asegurar que los mensajes enviados sean altamente relevantes, concisos y directamente relacionados con la atención médica solicitada. No se permite el uso de nuestra plataforma para envíos masivos de spam, promociones no solicitadas o contenido engañoso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Opt-out Sencillo y Claro (Mecanismo de Baja)</h2>
            <p>
              Reconocemos el derecho de todo usuario a detener la comunicación en cualquier momento.
            </p>
            <p className="mt-2">
              <strong>Cómo darse de baja:</strong> Cualquier usuario puede detener los mensajes simplemente respondiendo a nuestro canal de WhatsApp con la palabra <strong>"BAJA"</strong>, <strong>"STOP"</strong> o solicitándolo explícitamente. Nuestro sistema cesará automáticamente el envío de nuevas notificaciones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Restricciones de Comercio y Contenido</h2>
            <p>
              Los servicios proporcionados a través de PlexusMD están limitados al ámbito de la salud y administración clínica. Prohibimos estrictamente el uso de nuestra integración de WhatsApp para facilitar la venta de bienes ilícitos, servicios para adultos, alcohol, tabaco, u otros elementos restringidos por la Política de Comercio de WhatsApp.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-500">
          Última actualización: {new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </main>
  );
}
