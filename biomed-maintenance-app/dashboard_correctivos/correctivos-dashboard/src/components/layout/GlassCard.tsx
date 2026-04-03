import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export default function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-glassBorder bg-glass/70 backdrop-blur-xl shadow-glass",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Light sweep gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
      
      {/* Content wrapper with internal padding */}
      <div className="relative p-5">
        {children}
      </div>
    </div>
  );
}
