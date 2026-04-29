"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar as CalendarIcon, User } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { use } from "react";

export default function AgendaPage({ params }: { params: Promise<{ tenant: string }> }) {
  use(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Grid de 30 minutos (Ej: 09:00 a 14:00)
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  });
  
  // Citas mockeadas
  const appointments = [
    { time: "09:00", status: "occupied", patient: "Juan Pérez", reason: "Revisión anual", age: 45 },
    { time: "09:30", status: "available" },
    { time: "10:00", status: "occupied", patient: "María García", reason: "Dolor abdominal", age: 32 },
    { time: "10:30", status: "available" },
    { time: "11:00", status: "available" },
    { time: "11:30", status: "occupied", patient: "Carlos Ruiz", reason: "Resultados labs", age: 58 },
    { time: "12:00", status: "available" },
  ];

  const handleScheduleAppointment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert("En producción, esto redirigirá a Stripe Checkout.");
      setIsProcessing(false);
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 flex gap-6 h-[calc(100vh-6rem)]">
      
      {/* Columna Izquierda: Selector de Fechas (react-day-picker) */}
      <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200/50 p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-[#14B8A6] hover:bg-[#119e8f] text-white rounded-xl shadow-sm transition-colors font-medium"
        >
          <Plus size={20} />
          Nueva Cita
        </button>
        <div className="day-picker-wrapper">
          <DayPicker 
            mode="single" 
            selected={selectedDate} 
            onSelect={setSelectedDate}
            modifiersClassNames={{
              selected: "bg-[#14B8A6] text-white rounded-xl font-bold",
              today: "text-[#14B8A6] font-bold"
            }}
          />
        </div>
      </div>

      {/* Columna Derecha: Cuadrícula de 30 min */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <CalendarIcon className="text-[#14B8A6]" size={24} />
          <h2 className="text-xl font-bold text-[#1E293B]">
            {selectedDate ? dayjs(selectedDate).format("DD MMMM, YYYY") : "Selecciona una fecha"}
          </h2>
        </div>

        <div className="space-y-3">
          {timeSlots.map((time, index) => {
            const slot = appointments.find(a => a.time === time) || { time, status: "available" };
            
            return (
              <div key={index} className="flex group relative">
                <div className="w-20 text-slate-400 font-medium pt-3">{time}</div>
                <div className="flex-1 relative">
                  <div
                    onClick={() => slot.status === "available" && setIsModalOpen(true)}
                    className={`p-4 rounded-xl border transition-all h-full ${
                      slot.status === "occupied"
                        ? "bg-[#1E293B] border-[#1E293B] text-white shadow-md relative overflow-visible"
                        : "bg-[#14B8A6]/5 border-[#14B8A6]/20 hover:border-[#14B8A6] cursor-pointer border-dashed"
                    }`}
                  >
                    {slot.status === "occupied" ? (
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{slot.patient}</p>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Confirmada</span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Disponible</p>
                    )}

                    {/* Hover Card (Framer Motion) */}
                    {slot.status === "occupied" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        whileHover={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white text-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 z-10 pointer-events-none hidden group-hover:block"
                      >
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                          <User size={16} className="text-[#14B8A6]" />
                          <p className="font-bold">{slot.patient} ({slot.age}a)</p>
                        </div>
                        <p className="text-sm"><span className="font-semibold">Motivo:</span> {slot.reason}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Framer Motion (Nueva Cita) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 m-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1E293B]">Agendar Nueva Cita</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-[#1E293B] bg-slate-100/50 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Paciente</label><input type="text" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#14B8A6] outline-none" /></div>
                <div className="pt-4 flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-[#1E293B] hover:bg-slate-200 rounded-xl font-medium">Cancelar</button>
                  <button onClick={handleScheduleAppointment} disabled={isProcessing} className="flex-1 px-4 py-2 bg-[#14B8A6] text-white hover:bg-[#119e8f] rounded-xl font-medium disabled:opacity-50">
                    {isProcessing ? "Procesando..." : "Proceder al Pago"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .day-picker-wrapper .rdp {
          --rdp-cell-size: 38px;
          --rdp-accent-color: #14B8A6;
          --rdp-background-color: #f0fdfa;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
