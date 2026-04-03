import GlassCard from "../layout/GlassCard";

/**
 * GlassTooltip component for Recharts Tooltips using the GlassCard design.
 */
export function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="max-w-xs drop-shadow-2xl">
      <GlassCard className="!p-0 border-white/20">
        <div className="p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 leading-none">
            {label}
          </div>
          <div className="text-sm font-black text-white flex items-baseline gap-2">
            <span className="text-gold-glow">
              {payload[0].name ?? "Valor"}:
            </span>
            <span>{payload[0].value}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Keep default export for compatibility
export default GlassTooltip;
