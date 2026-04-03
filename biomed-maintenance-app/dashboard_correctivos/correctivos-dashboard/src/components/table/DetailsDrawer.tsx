import GlassCard from "../layout/GlassCard";
import { Correctivo } from "../../types/correctivo";

export default function DetailsDrawer({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: Correctivo | null;
}) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl p-4 animate-in slide-in-from-right duration-300">
        <GlassCard className="h-full overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-white/60 font-black uppercase tracking-widest pl-1 mb-1">Ticket</div>
              <div className="text-xl font-black text-gold-glow uppercase tracking-tight">
                #{item.id} — {item.equipo ?? "—"}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                {item.servicio ?? "—"} • {item.ubicacion ?? "—"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all shadow-none"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Descripción de daño</div>
              <div className="p-4 rounded-2xl border border-white/5 bg-white/3 text-white/80 text-sm leading-relaxed italic">
                "{item.descripcion ?? "—"}"
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Acción realizada</div>
              <div className="p-4 rounded-2xl border border-neonCyan/10 bg-neonCyan/5 text-neonCyan/90 text-sm leading-relaxed font-medium">
                {item.accion ?? "—"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Técnico</div>
                <div className="text-sm font-bold text-white/90 uppercase tracking-wide">{item.tecnico ?? "—"}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Causa</div>
                <div className="text-sm font-bold text-white/90 uppercase tracking-wide">{item.causa ?? "—"}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Fecha creación</div>
                <div className="text-sm font-bold text-white/90 font-mono tracking-tight">{item.fechaCreacion ?? "—"}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Fecha cierre</div>
                <div className="text-sm font-bold text-white/90 font-mono tracking-tight">{item.fechaCierre ?? "—"}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
