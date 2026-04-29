"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AiUsagePoint = {
  name: string;
  tokens: number;
};

export default function AiUsageChart({ data }: { data: AiUsagePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
        <Bar dataKey="tokens" fill="#14B8A6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
