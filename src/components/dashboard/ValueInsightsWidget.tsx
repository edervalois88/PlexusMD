"use client";

import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import { Clock3, FileText, ShieldCheck, Stethoscope } from "lucide-react";

import type { MonthlyValueMetrics, ValueMetric } from "@/lib/metrics-service";

const ValueInsightsChart = dynamic(() => import("./ValueInsightsChart"), {
  ssr: false,
  loading: () => <div className="h-[170px] animate-pulse rounded-2xl bg-white/40" />,
});

type ValueInsightsWidgetProps = {
  clinicName: string;
  metrics: MonthlyValueMetrics;
  compact?: boolean;
};

const formatChange = (metric: ValueMetric) => {
  if (metric.percentChange === 0) return "0% vs mes anterior";
  return `${metric.percentChange > 0 ? "+" : ""}${metric.percentChange}% vs mes anterior`;
};

const metricCards = (metrics: MonthlyValueMetrics) => [
  {
    label: "Interacciones prevenidas",
    value: metrics.preventedInteractions.value,
    suffix: "",
    detail: formatChange(metrics.preventedInteractions),
    icon: ShieldCheck,
  },
  {
    label: "Consultas asistidas",
    value: metrics.assistedConsultations.value,
    suffix: "",
    detail: formatChange(metrics.assistedConsultations),
    icon: Stethoscope,
  },
  {
    label: "Tiempo ahorrado",
    value: Math.round(metrics.savedMinutes.value / 60),
    suffix: "h",
    detail: `${metrics.savedMinutes.value} min acumulados`,
    icon: Clock3,
  },
];

export function generateValueReportPdf({ clinicName, metrics }: ValueInsightsWidgetProps) {
  const doc = new jsPDF();
  const cards = metricCards(metrics);

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 46, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Reporte de Valor PlexusMD", 18, 22);
  doc.setFontSize(11);
  doc.text(`${clinicName} · ${metrics.monthLabel}`, 18, 32);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.text("Resumen ejecutivo", 18, 62);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "La IA clinica apoyo decisiones medicas sin almacenar prompts ni expediente crudo en auditoria. El valor se estima con logs de Side Doctor, validaciones de medicamentos y eventos de consulta asistida.",
    18,
    70,
    { maxWidth: 174 },
  );

  cards.forEach((card, index) => {
    const x = 18 + index * 59;
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, 92, 52, 34, 3, 3);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text(`${card.value.toLocaleString("es-MX")}${card.suffix}`, x + 5, 108);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(card.label, x + 5, 116, { maxWidth: 42 });
    doc.text(card.detail, x + 5, 122, { maxWidth: 42 });
  });

  const maxValue = Math.max(...metrics.chartData.map((item) => item.consultations + item.interactions), 1);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Actividad auditada de IA", 18, 148);
  metrics.chartData.slice(-12).forEach((item, index) => {
    const x = 20 + index * 14;
    const height = Math.max(3, ((item.consultations + item.interactions) / maxValue) * 48);
    doc.setFillColor(20, 184, 166);
    doc.rect(x, 206 - height, 8, height, "F");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(item.name, x - 1, 214);
  });

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Fuente: AuditLog ai.side_doctor.*. Retencion y privacidad conforme a configuracion del tenant.", 18, 270);
  doc.save(`Reporte_Valor_${clinicName.replace(/\s+/g, "_")}_${metrics.monthLabel.replace(/\s+/g, "_")}.pdf`);
}

export function ValueInsightsWidget({ clinicName, metrics, compact = false }: ValueInsightsWidgetProps) {
  const cards = metricCards(metrics);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[#102027] text-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_240px]">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">Seguridad y Ahorro</p>
              <h2 className="mt-2 text-xl font-black">Valor generado por Side Doctor</h2>
            </div>
            <button
              type="button"
              onClick={() => generateValueReportPdf({ clinicName, metrics })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-slate-950 hover:bg-teal-50"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <Icon className="mb-3 text-teal-200" size={22} />
                  <p className="text-2xl font-black">{card.value.toLocaleString("es-MX")}{card.suffix}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-100">{card.label}</p>
                  <p className="mt-2 text-xs text-slate-300">{card.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        {!compact ? (
          <div className="rounded-xl border border-white/10 bg-white p-3 text-slate-900">
            <ValueInsightsChart data={metrics.chartData} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
