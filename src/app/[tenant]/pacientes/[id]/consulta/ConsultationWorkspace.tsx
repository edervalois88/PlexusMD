"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { AlertTriangle, BrainCircuit, FileText, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { validateMedicationSelection, streamConsultationInsights } from "./actions";

type PatientHistory = {
  conditions?: string[];
  previousMeds?: string[];
  allergies?: string[];
  pastNotes?: Array<{ date: string; note: string }>;
};

type PatientRecord = {
  id: string;
  organization_id: string;
  full_name: string;
  birth_date: string | null;
  medical_history_json: PatientHistory;
  updatedAt: string;
};

type MedicationOption = {
  id: string;
  name: string;
  commonDose: string;
  warnings: string[];
  legalNotes?: string | null;
};

type ClinicBranding = {
  clinicName: string;
  logoUrl?: string | null;
  doctorName?: string | null;
  doctorSignatureUrl?: string | null;
};

const imageUrlToDataUrl = async (url?: string | null) => {
  if (!url) return null;

  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function ConsultationWorkspace({
  patient,
  medications,
  branding,
}: {
  patient: PatientRecord;
  medications: MedicationOption[];
  branding: ClinicBranding;
}) {
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMedications, setSelectedMedications] = useState<MedicationOption[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [aiValidation, setAiValidation] = useState("");
  const [insights, setInsights] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const patientHistory = useMemo(() => patient.medical_history_json ?? {}, [patient.medical_history_json]);

  const medicationMatches = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return medications
      .filter((medication) => medication.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [medications, query]);

  const selectMedication = (medication: MedicationOption) => {
    setSelectedMedications((current) => [...current, medication]);
    setQuery(medication.name);

    startTransition(() => {
      void validateMedicationSelection({
        medication,
        patientHistory,
        selectedMedications,
        organizationId: patient.organization_id,
      }).then((result) => {
        setAlerts(result.alerts);
        setAiValidation(result.aiNote);
      });
    });
  };

  useEffect(() => {
    let cancelled = false;

    const runStreaming = async () => {
      setIsStreaming(true);
      setInsights("");

      const result = await streamConsultationInsights({
        patientName: patient.full_name,
        patientHistory,
        note: note || "Consulta en curso sin nota SOAP capturada.",
        selectedMedications,
        organizationId: patient.organization_id,
      });

      for (const chunk of result.chunks) {
        if (cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, 60));
        setInsights((current) => `${current}${chunk}`);
      }

      setIsStreaming(false);
    };

    const timeout = setTimeout(() => {
      runStreaming().catch(() => {
        setInsights("No fue posible generar insights en este momento.");
        setIsStreaming(false);
      });
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [note, patient.full_name, patient.organization_id, patientHistory, selectedMedications]);

  const generatePrescription = async () => {
    const doc = new jsPDF();
    const logo = await imageUrlToDataUrl(branding.logoUrl).catch(() => null);
    const signature = await imageUrlToDataUrl(branding.doctorSignatureUrl).catch(() => null);

    if (logo) {
      doc.addImage(logo, "PNG", 20, 16, 26, 26);
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(branding.clinicName || "PlexusMD", logo ? 52 : 20, 28);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("Receta medica", logo ? 52 : 20, 36);

    doc.setDrawColor(20, 184, 166);
    doc.line(20, 48, 190, 48);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text(`Paciente: ${patient.full_name}`, 20, 62);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, 20, 70);
    doc.text(`Medico: ${branding.doctorName ?? "Medico tratante"}`, 20, 78);

    doc.setFontSize(14);
    doc.text("Medicamentos", 20, 96);
    doc.setFontSize(11);

    selectedMedications.forEach((medication, index) => {
      const y = 108 + index * 18;
      doc.text(`${index + 1}. ${medication.name}`, 24, y);
      doc.text(`Dosis: ${medication.commonDose}`, 30, y + 7);
    });

    if (signature) {
      doc.addImage(signature, "PNG", 128, 230, 42, 22);
    }

    doc.line(118, 254, 182, 254);
    doc.setFontSize(10);
    doc.text("Firma del medico", 134, 262);
    doc.text("Validar contra expediente y normativa aplicable antes de dispensar.", 20, 282);

    doc.save(`Receta_${patient.full_name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-6 xl:grid-cols-[1fr_390px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">Consulta</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{patient.full_name}</h1>
          <p className="mt-2 text-sm text-slate-500">Nota SOAP, receta asistida y validacion cruzada en tiempo real.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Nota Médica</h2>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="S: Subjetivo...&#10;O: Objetivo...&#10;A: Analisis...&#10;P: Plan..."
            className="min-h-72 w-full resize-none rounded-2xl border border-slate-200 bg-[#F9FAFB] p-4 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Receta asistida</h2>
              <p className="text-sm text-slate-500">Selecciona medicamentos desde el vademécum controlado.</p>
            </div>
            <button
              onClick={generatePrescription}
              disabled={selectedMedications.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1E293B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              <FileText size={16} />
              Generar Receta
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar medicamento..."
              className="h-12 w-full rounded-2xl border border-slate-200 pl-10 pr-4 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          {query ? (
            <div className="mt-3 grid gap-2">
              {medicationMatches.map((medication) => (
                <button
                  key={medication.id}
                  type="button"
                  onClick={() => selectMedication(medication)}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-teal-200 hover:bg-teal-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{medication.name}</p>
                    <p className="text-sm text-slate-500">{medication.commonDose}</p>
                    {medication.legalNotes ? <p className="mt-1 text-xs text-amber-700">{medication.legalNotes}</p> : null}
                  </div>
                  <Plus className="text-teal-700" size={18} />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 space-y-2">
            {selectedMedications.map((medication, index) => (
              <div key={`${medication.id}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3">
                <div>
                  <p className="font-semibold text-slate-900">{medication.name}</p>
                  <p className="text-sm text-slate-500">{medication.commonDose}</p>
                </div>
                <button
                  onClick={() => setSelectedMedications((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {alerts.length || aiValidation ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle size={18} />
                Validación cruzada
              </div>
              {alerts.map((alert) => (
                <p key={alert} className="text-sm text-amber-800">- {alert}</p>
              ))}
              {aiValidation ? <div className="prose prose-sm mt-3 max-w-none text-amber-900"><ReactMarkdown>{aiValidation}</ReactMarkdown></div> : null}
            </div>
          ) : null}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#1E293B] p-2 text-teal-300">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="font-black text-slate-950">Side Doctor</h2>
              <p className="text-xs text-slate-500">{isStreaming ? "Generando insights..." : "Streaming activo"}</p>
            </div>
            <Sparkles className="ml-auto text-teal-600" size={18} />
          </div>
        </div>
        <div className="prose prose-sm max-h-[calc(100vh-14rem)] max-w-none overflow-y-auto p-5 text-slate-800">
          <ReactMarkdown>{insights || "Captura la nota o selecciona medicamentos para activar el análisis."}</ReactMarkdown>
        </div>
      </aside>
    </div>
  );
}
