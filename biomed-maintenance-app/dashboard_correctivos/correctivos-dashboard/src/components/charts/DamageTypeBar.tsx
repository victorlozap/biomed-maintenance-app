import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import GlassCard from "../layout/GlassCard";
import { GlassTooltip } from "./chartTooltip";

/**
 * DamageTypeBar component for displaying frequency of corrective causes/damage types.
 * @param {Object} props - Component properties.
 * @param {Array} props.data - Array of cause frequencies ({ name, value }).
 */
export default function DamageTypeBar({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <GlassCard className="h-full min-h-[400px]">
      <div className="mb-6">
        <div className="text-sm font-black uppercase tracking-[0.24em] text-white/40 leading-none mb-2">
          Análisis de Causa
        </div>
        <div className="text-xl font-bold text-gold-glow">Distribución de Daños</div>
        <div className="text-xs text-white/60 mt-1">Top causas más frecuentes este periodo</div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar 
              dataKey="value" 
              fill="rgba(34,211,238,0.6)" 
              radius={[8, 8, 0, 0]} 
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
