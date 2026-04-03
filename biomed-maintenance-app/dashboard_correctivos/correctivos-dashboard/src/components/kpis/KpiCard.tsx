import React from 'react'
import GlassCard from "../layout/GlassCard";
import { cn } from "../../lib/utils";
import { ReactNode } from "react";

/**
 * KpiCard component for displaying key performance indicators in a glassmorphic container.
 * Supports four predefined tones (cyan, violet, green, orange) to match the dashboard aesthetic.
 */
export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  tone = "cyan",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  tone?: "cyan" | "violet" | "green" | "orange";
}) {
  const toneMap = {
    cyan: "from-neonCyan/60 to-white/5 shadow-glowCyan",
    violet: "from-neonViolet/60 to-white/5 shadow-glowViolet",
    green: "from-emerald-400/50 to-white/5 shadow-glowGreen",
    orange: "from-orange-400/50 to-white/5 shadow-glowOrange",
  };

  return (
    <GlassCard className="h-full border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-center gap-5">
        {/* Icon container with background tone */}
        <div
          className={cn(
            "h-12 w-12 rounded-[18px] bg-gradient-to-br",
            toneMap[tone],
            "flex items-center justify-center border border-white/20",
            "group-hover:scale-105 transition-transform duration-300"
          )}
        >
          {icon}
        </div>
        
        {/* Metric information */}
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">
            {title}
          </div>
          <div className="text-2xl font-black text-white drop-shadow-sm flex items-baseline gap-1">
            <span className={cn(
              "text-gold-glow",
            )}>
              {value}
            </span>
          </div>
          {subtitle && (
            <div className="mt-1 text-xs font-semibold text-white/50 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
