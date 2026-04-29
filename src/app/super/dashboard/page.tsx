"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Activity, DollarSign, ShieldAlert } from "lucide-react";

const getDemoTokenUsage = (index: number, isWeekend: boolean) => {
  const seed = (index + 1) * 9301 + 49297;
  const normalized = (seed % 233280) / 233280;
  return isWeekend ? Math.floor(normalized * 500) + 200 : Math.floor(normalized * 3000) + 1500;
};

export default function SuperAdminDashboard() {
  // Mock Data (En producción vendría de una consulta a Supabase)
  const stats = {
    totalOrgs: 124,
    totalIncome: 15400, // USD
    globalAiUsage: 45850
  };

  // Generar datos ficticios de 30 días para la gráfica (Modo Demo "Poblado")
  const aiUsageData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      name: `${d.getDate()}/${d.getMonth() + 1}`,
      tokens: getDemoTokenUsage(i, isWeekend),
    };
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">Super Admin Panel</h1>
            <p className="text-slate-500 mt-1">Visión global de telemetría e infraestructura</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Clínicas Activas</p>
                <h3 className="text-2xl font-bold text-[#1E293B]">{stats.totalOrgs}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Ingresos Totales (Stripe)</p>
                <h3 className="text-2xl font-bold text-[#1E293B]">${stats.totalIncome.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Activity size={24} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Consumo IA (Tokens/Mes)</p>
                <h3 className="text-2xl font-bold text-[#1E293B]">{stats.globalAiUsage.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráfica */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-[#1E293B] mb-6">Consumo Global de IA (Últimos 30 días)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="tokens" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Panel de Control Remoto */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-red-500" size={20} />
            <h2 className="text-lg font-bold text-[#1E293B]">Control de Emergencia</h2>
          </div>
          <p className="text-slate-600 mb-4 text-sm max-w-2xl">
            Desde aquí puedes suspender remotamente el acceso de organizaciones en caso de falta de pago o detección de uso abusivo severo (DDoS/Spam) de los endpoints de IA.
          </p>
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors border border-slate-300">
            Gestionar Suspensiones Remotas
          </button>
        </motion.div>

      </div>
    </div>
  );
}
