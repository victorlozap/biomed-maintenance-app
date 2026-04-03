import type { Correctivo } from "../../types/corrective";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { X, Search, Activity, FileText } from "lucide-react";
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
  // Console log para depuración en Vercel
  if (open) console.log("Abriendo DetailsDrawer para:", item?.no_reporte);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Overlay - Negro al 60% */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />
      
      {/* Panel - Blanco/Azul oscuro con borde para visibilidad */}
      <div className="relative w-full max-w-lg h-full bg-[#0c111d] border-l border-white/20 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
        
        {/* Cabecera Segura */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="max-w-[85%]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Expediente Clínico de Equipo</span>
            <h3 className="text-xl font-bold text-white mt-1">
              #{item?.no_reporte || "SIN ID"} — {item?.equipo || "Equipo Desconocido"}
            </h3>
            <p className="text-sm text-white/50 truncate">
              {item?.servicio || "—"} • {item?.ubicacion || "—"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del reporte con scroll independiente */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-black/30">
          
          <section className="space-y-4">
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Descripción de la Falla</h4>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-sm text-white/90 leading-relaxed font-light">
                {item?.descripcion || "No se registró descripción del daño."}
              </div>
            </div>
            
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Protocolo de Intervención</h4>
              <div className="p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10 text-sm text-violet-100 font-medium leading-relaxed italic shadow-inner">
                {item?.accion || "Pendiente por documentar acción técnica."}
              </div>
            </div>
          </section>

          {/* Grid de especificaciones */}
          <section className="grid grid-cols-2 gap-3">
             {[
               { label: "Marca", value: item?.marca },
               { label: "Modelo", value: item?.modelo },
               { label: "Técnico Realizador", value: item?.tecnico },
               { label: "Causa Identificada", value: item?.causa },
               { label: "Fecha Reporte", value: item?.fecha_creacion, color: "text-emerald-400" },
               { label: "Fecha Cierre", value: item?.fecha_cierre, color: "text-emerald-400" }
             ].map((box, idx) => (
               <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5">
                 <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">{box.label}</span>
                 <p className={`text-xs font-semibold mt-1 truncate ${box.color || "text-white/80"}`}>
                   {box.value || "—"}
                 </p>
               </div>
             ))}
             
             <div className="col-span-2 p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 flex items-center justify-between">
                <div>
                   <span className="text-[9px] uppercase font-bold tracking-widest text-fuchsia-300">Estado Diagnóstico</span>
                   <p className="text-xs font-bold text-white uppercase">{item?.estado_equipo || "SIN REGISTRO"}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center animate-pulse">
                   <Activity size={16} className="text-fuchsia-400" />
                </div>
             </div>
          </section>

          {/* Información técnica profunda */}
          <section className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                <div>
                   <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">N. de Serie</span>
                   <p className="text-sm font-mono text-violet-300 font-bold tracking-tighter">{item?.serie || "SIN SERIE"}</p>
                </div>
                <FileText size={20} className="text-white/10" />
             </div>

             <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Inventario de Repuestos / Observaciones</h4>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/70 leading-relaxed italic">
                   {item?.observaciones || "No se registra uso de repuestos adicionales."}
                </div>
             </div>

             <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Bitácora de Seguimiento</h4>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/70 leading-relaxed font-light">
                   {item?.comentarios || "Sin comentarios de seguimiento para este reporte."}
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
