import type { Correctivo } from "../../types/corrective";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { X, Search } from "lucide-react";
import { useState } from "react";

// --- Tooltips ---
export function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-md p-3 shadow-2xl">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-violet-400">
        {payload[0].name || "Valor"}: {payload[0].value}
      </div>
    </div>
  );
}

// --- Charts ---
export function DamageTypeBar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 lg:p-6 backdrop-blur-xl h-[360px] flex flex-col">
      <div className="mb-4">
        <div className="text-sm font-semibold text-violet-300 uppercase tracking-widest">Daños por tipo (Causa)</div>
        <div className="text-xs text-white/40">Top 10 causas más frecuentes</div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
          <RechartsTooltip content={<GlassTooltip />} />
          <Bar dataKey="value" fill="rgba(167, 139, 250, 0.8)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportsLine({ data }: { data: { date: string; value: number }[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 lg:p-6 backdrop-blur-xl h-[360px] flex flex-col">
      <div className="mb-4">
        <div className="text-sm font-semibold text-fuchsia-300 uppercase tracking-widest">Evolución de reportes</div>
        <div className="text-xs text-white/40">Conteo diario</div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
          <RechartsTooltip content={<GlassTooltip />} />
          <Line type="monotone" dataKey="value" stroke="rgba(217, 70, 239, 0.8)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPie({ data }: { data: { name: string; value: number; fill: string }[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 lg:p-6 backdrop-blur-xl h-[360px] flex flex-col">
      <div className="mb-4">
        <div className="text-sm font-semibold text-emerald-300 uppercase tracking-widest">Distribución por estado</div>
        <div className="text-xs text-white/40">Estado general</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
        <div className="md:col-span-3 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip content={<GlassTooltip />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="md:col-span-2 flex flex-col justify-center gap-2">
          {data.sort((a, b) => b.value - a.value).map((d) => (
            <div key={d.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-xs text-white/80">{d.name}</span>
              </div>
              <span className="text-sm font-bold text-white/90">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- FilterBar ---
export function FilterBar({ onApplyFilter, estados, tecnicos }: any) {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const handleApply = () => {
    onApplyFilter({ q, estado, tecnico, desde, hasta });
  };

  const handleClear = () => {
    setQ(""); setEstado(""); setTecnico(""); setDesde(""); setHasta("");
    onApplyFilter({ q: "", estado: "", tecnico: "", desde: "", hasta: "" });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 lg:p-6 backdrop-blur-xl mb-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Búsqueda Global</label>
          <input 
            value={q} onChange={(e) => setQ(e.target.value)} 
            placeholder="Equipo, servicio..." 
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" 
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500">
            <option value="">TODOS</option>
            {estados.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 border-l border-white/5 pl-4 ml-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Técnico</label>
          <select value={tecnico} onChange={(e) => setTecnico(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500">
            <option value="">TODOS</option>
            {tecnicos.map((t: string) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 border-l border-white/5 pl-4 ml-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500" />
        </div>
        <div className="md:col-span-2 border-r border-white/5 pr-4 mr-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500" />
        </div>
        <div className="md:col-span-1 flex flex-col gap-2 pt-1 justify-center align-middle">
          <button onClick={handleApply} className="flex items-center justify-center gap-1 w-full rounded-xl border border-violet-500/50 bg-violet-600/80 hover:bg-violet-500 py-2 top-0 text-xs font-bold uppercase tracking-wide text-white transition-all shadow-lg hover:scale-105">
            <Search size={14} /> Buscar
          </button>
          <button onClick={handleClear} className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-[10px] font-bold uppercase tracking-wide text-white/50 hover:text-white transition-all">
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Details Drawer ---
export function DetailsDrawer({ open, onClose, item }: { open: boolean; onClose: () => void; item: Correctivo | null }) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-slate-900 border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-white/40">Reporte Correctivo</div>
            <h3 className="text-xl font-bold text-white mt-1">#{item.no_reporte} — {item.equipo || "N/A"}</h3>
            <p className="text-sm text-violet-300/80">{item.servicio || "—"} • {item.ubicacion || "—"}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
             <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Descripción del Daño</h4>
             <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
               {item.descripcion || "Sin descripción registrada."}
             </div>
          </div>
          <div>
             <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Acción Realizada</h4>
             <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
               {item.accion || "Sin acciones registradas aún."}
             </div>
             <div className="grid grid-cols-2 gap-4 mt-4">
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Marca</span>
                  <p className="text-sm font-semibold mt-1 text-violet-100">{item.marca || "—"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Modelo</span>
                  <p className="text-sm font-semibold mt-1 text-violet-100">{item.modelo || "—"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Técnico</span>
                 <p className="text-sm font-semibold mt-1">{item.tecnico || "—"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Causa</span>
                 <p className="text-sm font-semibold mt-1">{item.causa || "—"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Fecha Creación</span>
                  <p className="text-sm font-semibold mt-1 text-emerald-300">{item.fecha_creacion || "—"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Fecha Cierre</span>
                  <p className="text-sm font-semibold mt-1 text-emerald-300">{item.fecha_cierre || "—"}</p>
               </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 col-span-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Estado Equipo</span>
                  <p className="text-sm font-semibold mt-1 text-amber-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse"></span>
                    {item.estado_equipo || "—"}
                  </p>
               </div>
             </div>
          </div>

          <div className="space-y-4 pt-2">
            {item.serie && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Serie</h4>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-sm font-mono text-violet-200">
                  {item.serie}
                </div>
              </div>
            )}
            {item.observaciones && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Observaciones / Repuestos</h4>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/80 leading-relaxed italic">
                  {item.observaciones}
                </div>
              </div>
            )}
            {item.comentarios && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Comentarios Adicionales</h4>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/80 leading-relaxed">
                  {item.comentarios}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
