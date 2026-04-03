import { useMemo, useState } from "react";
import GlassCard from "../layout/GlassCard";
import DetailsDrawer from "./DetailsDrawer";
import { Correctivo } from "../../types/correctivo";
import { normalizarEstado } from "../../lib/aggregations";

export default function CorrectivosTable({ data }: { data: Correctivo[] }) {
  const [selected, setSelected] = useState<Correctivo | null>(null);

  const rows = useMemo(() => data, [data]);

  return (
    <>
      <GlassCard className="!p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-black text-gold-glow uppercase tracking-[0.2em]">Tabla detallada</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
              {rows.length} registros (según filtros)
            </div>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-white/5 bg-white/[0.02]">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Equipo</th>
                <th className="px-5 py-4">Servicio</th>
                <th className="px-5 py-4">Ubicación</th>
                <th className="px-5 py-4">Técnico</th>
                <th className="px-5 py-4">Causa</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {rows.map((r) => {
                const e = normalizarEstado(r);
                const badge =
                  e === "CERRADO"
                    ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                    : e === "TRABAJANDO"
                    ? "bg-blue-400/10 text-blue-400 border-blue-400/20"
                    : "bg-amber-400/10 text-amber-400 border-amber-400/20";

                return (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-5 py-4 text-white/50 text-[11px] font-mono tracking-tighter">{r.fechaCreacion ?? "—"}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-white/90 uppercase tracking-tight group-hover:text-neonCyan transition-all">
                        {r.equipo ?? "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-[10px] font-black uppercase tracking-wider">{r.servicio ?? "—"}</td>
                    <td className="px-5 py-4 text-white/40 text-[10px] font-black uppercase tracking-wider">{r.ubicacion ?? "—"}</td>
                    <td className="px-5 py-4 text-white/40 text-[10px] font-black uppercase tracking-wider">{r.tecnico ?? "—"}</td>
                    <td className="px-5 py-4 text-white/40 text-[10px] font-black uppercase tracking-wider">{r.causa ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-[9px] font-black tracking-[0.1em] uppercase ${badge}`}>
                        {e}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/40 hover:bg-white/10 hover:text-white transition-all group-hover:border-neonCyan/40"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <div className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">
                      Sin resultados con los filtros actuales.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <DetailsDrawer open={!!selected} item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
