"use client";

import { useState, useOptimistic, use, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { SideDoctorPanel } from "@/components/side-doctor/SideDoctorPanel";
import { FileText, AlertTriangle, Activity, CheckCircle2, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientEMRPage({ params }: { params: Promise<{ tenant: string, id: string }> }) {
  const resolvedParams = use(params);
  // Mock Data
  const patient = {
    id: resolvedParams.id,
    name: "Ana Martínez",
    age: 32,
    weight: "65 kg",
    height: "1.68 m",
    bloodType: "O+",
    allergies: ["Penicilina", "Nueces"],
    history: { conditions: ["Asma leve"], previousMeds: ["Salbutamol PRN"] }
  };

  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const validateAccess = async () => {
    try {
      // Validación simulada para demostración
      setTimeout(() => setIsValidating(false), 1200);
    } catch (err: unknown) {
        setValidationError(err instanceof Error ? err.message : "Error validando acceso.");
        setIsValidating(false);
      }
    };
    validateAccess();
  }, [resolvedParams.tenant, resolvedParams.id]);

  // SOAP Editor State with useOptimistic
  const [serverSoap, setServerSoap] = useState("");
  const [optimisticSoap, addOptimisticSoap] = useOptimistic(
    serverSoap,
    (state, newSoap: string) => newSoap
  );
  
  const [debouncedSoap] = useDebounce(optimisticSoap, 1500);
  const [isSaving, setIsSaving] = useState(false);
  const isFirstRender = useRef(true);

  // Auto-Save Effect (SWR pattern background sync)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const saveToDB = async () => {
      setIsSaving(true);
      // Simulate API call to save SOAP note
      await new Promise(resolve => setTimeout(resolve, 800));
      setServerSoap(debouncedSoap);
      setIsSaving(false);
    };

    if (debouncedSoap !== serverSoap) {
      saveToDB();
    }
  }, [debouncedSoap, serverSoap]);

  // Prescription Modal State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");

  const handleGeneratePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("Arctic Clinical", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Receta Médica", 20, 30);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${patient.name}`, 20, 50);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.setFontSize(16);
    doc.text("Prescripción:", 20, 80);
    doc.setFontSize(12);
    doc.text(`Medicamento: ${medication}`, 20, 90);
    doc.text(`Dosis e indicaciones: ${dosage}`, 20, 100);
    
    try {
      const qrDataUrl = await QRCode.toDataURL(`valid_rx_${patient.id}_${medication}_${dosage}`);
      doc.addImage(qrDataUrl, "PNG", 160, 250, 30, 30);
      doc.setFontSize(8);
      doc.text("Validación QR", 163, 285);
    } catch (e) {
      console.error(e);
    }
    doc.save(`Receta_${patient.name.replace(" ", "_")}.pdf`);
    setIsPrescriptionModalOpen(false);
  };

  const handleShowcaseMode = () => {
    const complexCase = `S: Paciente acude por referir cefalea intensa de 3 días de evolución, acompañada de visión borrosa. Refiere haber suspendido su medicamento antihipertensivo (Losartán) hace una semana por motivos económicos. No presenta fiebre.
O: TA: 180/110 mmHg, FC: 95 lpm, FR: 18 rpm, Temp: 36.8°C. Paciente consciente, alerta, orientado. Pupilas isocóricas y normorreflécticas. Sin déficit motor ni sensitivo aparente. Resto de exploración sin alteraciones significativas.
A: Crisis hipertensiva, urgencia hipertensiva vs emergencia (descartar daño a órgano blanco). Falta de adherencia terapéutica.
P: 1. Reiniciar Losartán 50mg c/12h.
2. Añadir Amlodipino 5mg c/24h.
3. Solicitar laboratorios: BH, QS, EGO, ECG de 12 derivaciones para evaluación de órgano blanco.
4. Cita abierta a urgencias si empeora visión o presenta dolor torácico.`;
    addOptimisticSoap(complexCase);
    setServerSoap(complexCase); // Forzar el update para evitar que el useOptimistic lo borre si no se guarda rápido
  };

  if (validationError) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-red-500 font-medium">Error: {validationError}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      {isValidating ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-[calc(100vh-4rem)] gap-6"
        >
          <div className="w-1/5 bg-white rounded-2xl p-6 border border-slate-200/50 space-y-6">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-24 w-full mt-6 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="w-[55%] flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50 flex-1">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
          <div className="w-1/4 h-full">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex h-[calc(100vh-4rem)] gap-6"
        >
          {/* Columna Izquierda (20%) - Perfil */}
          <div className="w-1/5 bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-slate-400">
                {patient.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-[#1E293B]">{patient.name}</h2>
              <p className="text-slate-500 text-sm">{patient.age} años • {patient.bloodType}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h3 className="text-red-800 font-semibold flex items-center gap-2 mb-2 text-sm">
                  <AlertTriangle size={16} /> Alergias
                </h3>
                <ul className="list-disc pl-5 text-red-600 text-sm">
                  {patient.allergies.map(a => <li key={a}>{a}</li>)}
                </ul>
              </div>

              <div className="bg-[#F9FAFB] p-4 rounded-xl border border-slate-100">
                <h3 className="text-[#1E293B] font-semibold flex items-center gap-2 mb-3 text-sm">
                  <Activity size={16} className="text-[#14B8A6]" /> Signos Vitales
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Peso:</span> <span>{patient.weight}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Estatura:</span> <span>{patient.height}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Central (55%) - SOAP y Timeline */}
          <div className="w-[55%] flex flex-col gap-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-[#1E293B]">Nota de Evolución (SOAP)</h2>
                  
                  {/* Indicador de Guardado Optimista */}
                  <AnimatePresence>
                    {(optimisticSoap !== serverSoap || isSaving) ? (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-slate-400 flex items-center gap-1">
                        Guardando...
                      </motion.span>
                    ) : (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-[#14B8A6] flex items-center gap-1">
                        <CheckCircle2 size={12} /> Guardado
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleShowcaseMode}
                    title="Modo Demo: Autocompletar Caso Complejo"
                    className="flex items-center gap-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Wand2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsPrescriptionModalOpen(true)}
                    className="flex items-center gap-2 text-sm bg-[#14B8A6] hover:bg-[#119e8f] text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <FileText size={16} /> Receta
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 w-full bg-[#F9FAFB] border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white transition-all resize-none"
                placeholder="S: Subjetivo...&#10;O: Objetivo...&#10;A: Análisis...&#10;P: Plan..."
                value={optimisticSoap}
                onChange={(e) => addOptimisticSoap(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 h-64">
              <h2 className="text-lg font-bold text-[#1E293B] mb-4">Consultas Anteriores</h2>
              <div className="space-y-4 text-sm">
                <div className="border-l-2 border-[#14B8A6] pl-4 pb-4">
                  <p className="text-slate-400 text-xs">12 Oct 2023</p>
                  <p className="font-medium text-[#1E293B]">Control de asma. Paciente estable.</p>
                </div>
                <div className="border-l-2 border-slate-200 pl-4">
                  <p className="text-slate-400 text-xs">05 Ene 2023</p>
                  <p className="font-medium text-[#1E293B]">Infección respiratoria aguda.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha (25%) - Side Doctor */}
          <div className="w-1/4 h-full relative">
            <SideDoctorPanel
              isOpen={true}
              onClose={() => {}}
              patientId={patient.id}
              patientHistory={patient.history}
              updatedAt={`demo-${patient.id}`}
              reason={debouncedSoap || "Consulta general"}
              variant="inline"
            />
          </div>
        </motion.div>
      )}

      {/* Modal de Receta */}
      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPrescriptionModalOpen(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 m-4">
              <h3 className="text-xl font-bold text-[#1E293B] mb-4">Generar Receta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medicamento</label>
                  <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-[#14B8A6]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosis / Indicaciones</label>
                  <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-[#14B8A6]" />
                </div>
                <button onClick={handleGeneratePDF} disabled={!medication || !dosage} className="w-full py-2 bg-[#14B8A6] text-white rounded-xl font-medium disabled:opacity-50">
                  Exportar a PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
