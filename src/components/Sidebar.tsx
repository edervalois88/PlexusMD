"use client";

import Link from "next/link";
import { LayoutDashboard, Calendar, Users, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar({ tenant }: { tenant: string }) {
  const [isHealthy, setIsHealthy] = useState(true);

  // Simulación de Health Check Periódico
  useEffect(() => {
    const checkHealth = () => {
      // Aquí haríamos un fetch a un endpoint /api/health
      setIsHealthy(true);
    };
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/20 backdrop-blur-[12px] border-r border-slate-200/50 flex flex-col p-4">
      <div className="mb-8 px-4 flex justify-between items-center mt-2">
        <h1 className="text-xl font-bold text-[#1E293B]">Arctic Clinical</h1>
        <div className="group relative flex items-center justify-center">
          <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          {isHealthy && (
            <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          )}
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {isHealthy ? "Sistemas Operativos (AI & DB)" : "Conexión Degradada"}
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        <Link
          href={`/${tenant}`}
          className="flex items-center gap-3 px-4 py-2 text-[#1E293B] hover:bg-white/40 rounded-xl transition-colors"
        >
          <LayoutDashboard size={20} className="text-[#14B8A6]" />
          <span>Dashboard</span>
        </Link>
        <Link
          href={`/${tenant}/agenda`}
          className="flex items-center gap-3 px-4 py-2 text-[#1E293B] hover:bg-white/40 rounded-xl transition-colors"
        >
          <Calendar size={20} className="text-[#14B8A6]" />
          <span>Agenda</span>
        </Link>
        <Link
          href={`/${tenant}/pacientes`}
          className="flex items-center gap-3 px-4 py-2 text-[#1E293B] hover:bg-white/40 rounded-xl transition-colors"
        >
          <Users size={20} className="text-[#14B8A6]" />
          <span>Pacientes</span>
        </Link>
      </nav>
      <div className="mt-auto">
        <Link
          href={`/${tenant}/configuracion/auditoria`}
          className="flex items-center gap-3 px-4 py-2 text-[#1E293B] hover:bg-white/40 rounded-xl transition-colors"
        >
          <Settings size={20} className="text-[#14B8A6]" />
          <span>Configuración</span>
        </Link>
      </div>
    </aside>
  );
}
