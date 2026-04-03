import GlassCard from "../layout/GlassCard";

/**
 * FilterBar component for multi-criteria filtering of corrective maintenance reports.
 */
export default function FilterBar({
  q,
  setQ,
  estado,
  setEstado,
  tecnico,
  setTecnico,
  desde,
  setDesde,
  hasta,
  setHasta,
  estados,
  tecnicos,
}: any) {
  return (
    <GlassCard className="!p-4 border-white/10 shadow-none bg-transparent">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input */}
        <div className="md:col-span-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 block pl-1">
            Búsqueda General
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Equipo, servicio, técnicos..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-neonCyan/40 focus:bg-white/10"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 block pl-1">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-all focus:border-neonCyan/40 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22white%22%20stroke-opacity%3D%220.4%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
          >
            <option value="" className="bg-[#0f172a]">Todos los estados</option>
            {estados.map((s: string) => (
              <option key={s} value={s} className="bg-[#0f172a]">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Technician Filter */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 block pl-1">
            Técnico
          </label>
          <select
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-all focus:border-neonCyan/40 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22white%22%20stroke-opacity%3D%220.4%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
          >
            <option value="" className="bg-[#0f172a]">Cualquier técnico</option>
            {tecnicos.map((t: string) => (
              <option key={t} value={t} className="bg-[#0f172a]">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 block pl-1">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-neonCyan/40 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 block pl-1">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-neonCyan/40 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Clear Button */}
        <div className="md:col-span-1 flex items-end">
          <button
            onClick={() => {
              setQ("");
              setEstado("");
              setTecnico("");
              setDesde("");
              setHasta("");
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all h-[38px]"
          >
            Borrar
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
