import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import GlassCard from "../layout/GlassCard";
import { GlassTooltip } from "./chartTooltip";

/**
 * ReportsLine component for displaying corrective trends over time using a LineChart.
 */
export default function ReportsLine({
  data,
}: {
  data: { date: string; value: number }[];
}) {
  return (
    <GlassCard className="h-full min-h-[400px]">
      <div className="mb-6">
        <div className="text-sm font-black uppercase tracking-[0.24em] text-white/40 leading-none mb-2">
          Productividad
        </div>
        <div className="text-xl font-bold text-gold-glow">Tendencia Temporal</div>
        <div className="text-xs text-white/60 mt-1">Conteo diario de reportes creados</div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<GlassTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Reportes"
              stroke="rgba(139,92,246,0.9)" 
              strokeWidth={4} 
              dot={false}
              activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
