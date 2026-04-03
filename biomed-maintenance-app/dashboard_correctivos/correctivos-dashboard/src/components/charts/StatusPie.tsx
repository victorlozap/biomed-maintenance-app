import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import GlassCard from "../layout/GlassCard";
import { GlassTooltip } from "./chartTooltip";

/**
 * Color mapping for normalized states in the donut chart.
 */
const COLORS: Record<string, string> = {
  CERRADO: "rgba(16,185,129,0.80)",
  PENDIENTE: "rgba(239,68,68,0.80)",
  TRABAJANDO: "rgba(59,130,246,0.80)",
  OTRO: "rgba(168,85,247,0.80)",
  SIN_ESTADO: "rgba(148,163,184,0.70)",
};

/**
 * StatusPie component for displaying corrective reports by status.
 */
export default function StatusPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <GlassCard className="h-full min-h-[400px]">
      <div className="mb-6">
        <div className="text-sm font-black uppercase tracking-[0.24em] text-white/40 leading-none mb-2">
          Gestión Operativa
        </div>
        <div className="text-xl font-bold text-gold-glow">Estado de Reportes</div>
        <div className="text-xs text-white/60 mt-1">Conteo por fase de atención</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[280px]">
        <div className="md:col-span-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<GlassTooltip />} />
              <Pie 
                data={data} 
                dataKey="value" 
                nameKey="name" 
                innerRadius={70} 
                outerRadius={95} 
                paddingAngle={5}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={COLORS[entry.name] ?? "rgba(34,211,238,0.75)"} 
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center gap-3">
          {data
            .sort((a, b) => b.value - a.value)
            .map((d) => (
              <div 
                key={d.name} 
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="h-3 w-3 rounded-full shadow-lg" 
                    style={{ background: COLORS[d.name] ?? "rgba(34,211,238,0.75)" }} 
                  />
                  <span className="text-xs font-black uppercase tracking-widest text-white/70">
                    {d.name}
                  </span>
                </div>
                <span className="text-sm font-black text-gold-glow">{d.value}</span>
              </div>
            ))}
        </div>
      </div>
    </GlassCard>
  );
}
