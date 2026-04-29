"use client";

import { motion } from "framer-motion";
import { Users, Activity, UserPlus, Settings } from "lucide-react";

export default function OrgAdminDashboard({ params }: { params: { tenant: string } }) {
  // Mock Data (En producción vendría de Supabase)
  const stats = {
    totalDoctors: 4,
    totalPatients: 142,
    aiUsageCount: 450, // Consumo de tokens/llamadas de la clínica
  };

  const recentPatients = [
    { name: "Ana Martínez", lastVisit: "Hace 2 días", doctor: "Dr. Ruiz" },
    { name: "Juan Pérez", lastVisit: "Hace 5 días", doctor: "Dra. Gómez" },
    { name: "María García", lastVisit: "Hace 1 semana", doctor: "Dr. Ruiz" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Panel de Administración</h1>
          <p className="text-slate-500 mt-1">Gestiona tu clínica y monitorea tus recursos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors text-sm font-medium">
          <Settings size={18} />
          Configuración General
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Médicos Registrados</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">{stats.totalDoctors}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 flex items-center gap-4">
          <div className="p-4 bg-[#14B8A6]/10 text-[#14B8A6] rounded-2xl"><UserPlus size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pacientes Totales</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">{stats.totalPatients}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} className="text-[#14B8A6]" />
            <p className="text-sm font-medium text-slate-500">Cuota de IA (Mes Actual)</p>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-[#1E293B]">{stats.aiUsageCount}</h3>
            <span className="text-sm text-slate-400 mb-1">llamadas</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            {/* Barra de progreso simulando un límite de 1000 llamadas */}
            <div className="bg-[#14B8A6] h-1.5 rounded-full" style={{ width: `${(stats.aiUsageCount / 1000) * 100}%` }}></div>
          </div>
        </motion.div>
      </div>

      {/* Lista de Pacientes Recientes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
        <h2 className="text-lg font-bold text-[#1E293B] mb-6">Actividad Reciente de Pacientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 border-b border-slate-100">
              <tr>
                <th className="pb-3 font-medium">Paciente</th>
                <th className="pb-3 font-medium">Última Visita</th>
                <th className="pb-3 font-medium">Médico Asignado</th>
                <th className="pb-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPatients.map((p, i) => (
                <tr key={i}>
                  <td className="py-4 font-medium text-[#1E293B]">{p.name}</td>
                  <td className="py-4 text-slate-500">{p.lastVisit}</td>
                  <td className="py-4 text-slate-500">{p.doctor}</td>
                  <td className="py-4 text-right">
                    <button className="text-[#14B8A6] hover:text-[#119e8f] font-medium transition-colors">
                      Ver Expediente
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
