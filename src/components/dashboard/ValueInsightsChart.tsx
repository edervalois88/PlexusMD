"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ValueChartPoint = {
  name: string;
  interactions: number;
  consultations: number;
  minutes: number;
};

export default function ValueInsightsChart({ data }: { data: ValueChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={170} minWidth={0} minHeight={160}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={28} />
        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
        <Bar dataKey="interactions" name="Alertas" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="consultations" name="Consultas IA" fill="#14b8a6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="minutes" name="Minutos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
