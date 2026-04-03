import { Activity, Download, RefreshCw } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {/* Logo and Title Group */}
        <div className="inline-flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-neonCyan/40 to-neonViolet/40 backdrop-blur border border-white/20 shadow-glowCyan flex items-center justify-center">
            <Activity className="text-white drop-shadow-sm w-5 h-5" />
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-gold-glow uppercase">
            Dashboard Correctivos — 2026
          </h1>
        </div>
        
        {/* Description Label */}
        <p className="mt-2 text-sm text-white/60 font-medium max-w-2xl leading-relaxed">
          Visualización avanzada e interactiva para el seguimiento de reportes técnicos, análisis de causas raíz y cumplimiento de ANS en mantenimiento correctivo.
        </p>
      </div>

      {/* Actions Group */}
      <div className="flex items-start gap-3 mt-1.5 font-black uppercase tracking-widest text-[10px]">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all">
          <Download className="w-4 h-4 cursor-pointer" />
          <span>Exportar</span>
        </button>
        <button className="h-[38px] w-[38px] flex items-center justify-center rounded-xl border border-white/10 bg-neonCyan/10 text-neonCyan hover:bg-neonCyan/20 transition-all group">
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
}
