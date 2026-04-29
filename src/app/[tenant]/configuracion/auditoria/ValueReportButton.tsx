"use client";

import { FileText } from "lucide-react";

import { generateValueReportPdf } from "@/components/dashboard/ValueInsightsWidget";
import type { MonthlyValueMetrics } from "@/lib/metrics-service";

export function ValueReportButton({ clinicName, metrics }: { clinicName: string; metrics: MonthlyValueMetrics }) {
  return (
    <button
      type="button"
      onClick={() => generateValueReportPdf({ clinicName, metrics, compact: true })}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 text-sm font-semibold text-white hover:bg-slate-900"
    >
      <FileText size={16} />
      Generar Reporte de Valor (PDF)
    </button>
  );
}
