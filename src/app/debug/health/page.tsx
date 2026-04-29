"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function DebugHealthPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos la llamada a una Server Action o Endpoint /api/health
    const checkSystems = async () => {
      setLoading(true);
      
      // Aquí iría el fetch real:
      // const res = await fetch('/api/health');
      // const data = await res.json();
      
      // Simulación de los resultados de health check para la maqueta:
      setTimeout(() => {
        setStatus({
          postgres: { ok: true, latency: "42ms" },
          redisKV: { ok: true, latency: "15ms" },
          stripeAPI: { ok: true, latency: "120ms" },
          geminiAPI: { ok: true, latency: "850ms" },
        });
        setLoading(false);
      }, 1500);
    };

    checkSystems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E293B] text-white flex flex-col items-center justify-center font-mono">
        <Loader2 className="animate-spin text-[#14B8A6] mb-4" size={48} />
        <p>Iniciando Pre-flight Check de Producción...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] text-slate-300 p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">System Health (Pre-flight)</h1>
        <p className="text-slate-500 mb-8">Último chequeo: {new Date().toLocaleString()}</p>

        <div className="space-y-4">
          <HealthItem name="PostgreSQL (Supabase)" data={status.postgres} />
          <HealthItem name="Redis (Vercel KV)" data={status.redisKV} />
          <HealthItem name="Stripe API" data={status.stripeAPI} />
          <HealthItem name="Gemini API" data={status.geminiAPI} />
        </div>

        <div className="mt-12 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm">
          <p className="text-emerald-400 font-bold mb-2">ALL SYSTEMS GO</p>
          <p>El entorno está listo para recibir tráfico de producción.</p>
        </div>
      </div>
    </div>
  );
}

function HealthItem({ name, data }: { name: string, data: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
      <div className="flex items-center gap-3">
        {data.ok ? (
          <CheckCircle2 className="text-emerald-500" size={24} />
        ) : (
          <XCircle className="text-red-500" size={24} />
        )}
        <span className="font-semibold text-slate-200">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500">Latency: {data.latency}</span>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${data.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {data.ok ? 'OPERATIONAL' : 'OUTAGE'}
        </span>
      </div>
    </div>
  );
}
