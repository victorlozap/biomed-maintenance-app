import type { Correctivo } from "../../types/corrective";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { X, Search, Activity, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { generateCorrectiveTemplatePDF } from "../../utils/pdfCorrectiveTemplateGenerator";

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
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 lg:p-8 backdrop-blur-xl h-[420px] flex flex-col group overflow-hidden">
      <div className="mb-6">
        <div className="text-sm font-black text-violet-300 uppercase tracking-[0.2em]">Daños por tipo (Causa)</div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Análisis de fallas recurrentes</div>
      </div>
      <div className="flex-1 min-h-0 w-full translate-x-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }} 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tickMargin={12}
            />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
            <RechartsTooltip content={<GlassTooltip />} />
            <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(167, 139, 250, 1)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
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
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl h-[420px] flex flex-col overflow-hidden">
      <div className="mb-6">
        <div className="text-sm font-black text-emerald-300 uppercase tracking-[0.2em]">Distribución por estado</div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Corte actual de órdenes</div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* Pie arriba */}
        <div className="h-[60%] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip content={<GlassTooltip />} />
              <Pie 
                data={data} 
                dataKey="value" 
                nameKey="name" 
                innerRadius="65%" 
                outerRadius="95%" 
                paddingAngle={6}
              >
                {data.map((entry) => <Cell key={entry.name} fill={entry.fill} stroke="none" />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyendas abajo en grid de chips */}
        <div className="h-[40%] grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1 content-center">
          {[...data].sort((a, b) => b.value - a.value).map((d) => (
            <div key={d.name} className="flex flex-col justify-center rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 px-3 py-2 transition-colors">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest truncate">{d.name}</span>
              </div>
              <span className="text-sm font-black text-white">{d.value}</span>
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
export function DetailsDrawer({ open, onClose, item, onUpdateItem, tecnicos = [] }: { open: boolean; onClose: () => void; item: Correctivo | null; onUpdateItem?: (updatedItem: Correctivo) => void, tecnicos?: string[] }) {
  // Console log para depuración
  if (open) console.log("Abriendo DetailsDrawer para:", item?.no_reporte);

  const [fechaReporte, setFechaReporte] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Correctivo>>({});
  const [searchAsset, setSearchAsset] = useState("");
  const [assetResults, setAssetResults] = useState<any[]>([]);

  const isEditable = item?.estado_norm === "PENDIENTE" || item?.estado_norm === "TRABAJANDO";

  useEffect(() => {
    if (item) {
      let d = item.fecha_creacion || "";
      if (d && d.includes("T")) {
        d = d.split("T")[0];
      }
      setFechaReporte(d);
      setFormData({
        equipo: item.equipo,
        marca: item.marca,
        modelo: item.modelo,
        serie: item.serie,
        activo_fijo: item.activo_fijo,
        tecnico: item.tecnico,
        causa: item.causa,
        descripcion: item.descripcion,
        accion: item.accion,
        observaciones: item.observaciones,
        comentarios: item.comentarios,
        estado_equipo: item.estado_equipo,
        servicio: item.servicio,
        ubicacion: item.ubicacion,
        estado_norm: item.estado_norm,
      });
    }
  }, [item]);

  // Búsqueda de Activo Fijo
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchAsset.length >= 2) {
        const { data, error } = await supabase
          .from('equipments')
          .select('*')
          .or(`id_unico.ilike.%${searchAsset}%,equipo.ilike.%${searchAsset}%`)
          .limit(5);

        if (!error) setAssetResults(data || []);
      } else {
        setAssetResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchAsset]);

  const handleSelectAsset = (asset: any) => {
    setFormData((prev: Partial<Correctivo>) => ({
      ...prev,
      activo_fijo: asset.id_unico,
      equipo: asset.equipo,
      marca: asset.marca,
      modelo: asset.modelo,
      serie: asset.numero_serie || asset.serie || asset.serial || "",
      servicio: asset.servicio,
      ubicacion: asset.ubicacion,
      equipment_id: asset.id
    }));
    setSearchAsset("");
    setAssetResults([]);
  };

  const handleSaveChanges = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      // Si el estado cambia a CERRADO y no hay fecha de cierre, ponemos la de hoy
      let fechaCierreFinal = formData.fecha_cierre;
      if (formData.estado_norm === "CERRADO" && !fechaCierreFinal) {
        fechaCierreFinal = new Date().toISOString();
      }

      const updatePayload = {
        ...formData,
        fecha_creacion: fechaReporte || null,
        fecha_cierre: fechaCierreFinal
      };

      const { error } = await supabase
        .from("correctivos_husj")
        .update(updatePayload)
        .eq("no_reporte", item.no_reporte);

      if (error) throw error;
      
      alert("✅ Datos actualizados correctamente");
      if (onUpdateItem) {
        onUpdateItem({ ...item, ...updatePayload } as Correctivo);
      }
    } catch (e: any) {
      alert("❌ Error al guardar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

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
              #{item?.no_reporte || "SIN ID"} — {formData.equipo || item?.equipo || "Equipo Desconocido"}
            </h3>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-white/50 truncate">
                {formData.servicio || item?.servicio || "—"} • {formData.ubicacion || item?.ubicacion || "—"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {formData.activo_fijo && (
                  <p className="text-[10px] text-violet-500 font-black tracking-widest uppercase bg-violet-500/10 px-2 py-0.5 rounded">
                    AF: {formData.activo_fijo}
                  </p>
                )}
                <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                  formData.estado_norm === 'CERRADO' ? 'bg-emerald-500/10 text-emerald-400' :
                  formData.estado_norm === 'TRABAJANDO' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {formData.estado_norm}
                </span>
              </div>
            </div>
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
            {isEditable && (
              <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 space-y-6">
                <div className="relative">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-violet-400 mb-2">Vincular Activo Fijo</h4>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text"
                      value={searchAsset}
                      onChange={(e) => setSearchAsset(e.target.value)}
                      placeholder="Buscar por placa o nombre de equipo..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-violet-500 outline-none transition-all"
                    />
                  </div>
                  {assetResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                      {assetResults.map( asset => (
                        <div 
                          key={asset.id} 
                          onClick={() => handleSelectAsset(asset)}
                          className="px-4 py-3 hover:bg-violet-600/20 cursor-pointer border-b border-white/5 flex justify-between items-center transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-white tracking-tight">{asset.equipo}</p>
                            <p className="text-[9px] text-white/30 font-black uppercase">
                              #{asset.id_unico} • {asset.marca} • S/N: {asset.numero_serie || asset.serial || asset.serie || '---'}
                            </p>
                          </div>
                          <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">{asset.servicio}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30">Nombre del Equipo</h4>
                     <input 
                        value={formData.equipo || ""}
                        onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, equipo: e.target.value }))}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-violet-500"
                        placeholder="Nombre..."
                     />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30">Servicio / Unidad</h4>
                     <input 
                        value={formData.servicio || ""}
                        onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, servicio: e.target.value }))}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-violet-500"
                        placeholder="Servicio..."
                     />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30">Ubicación Física</h4>
                     <input 
                        value={formData.ubicacion || ""}
                        onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, ubicacion: e.target.value }))}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-violet-500"
                        placeholder="Ubicación..."
                     />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30">Estado de la Orden</h4>
                     <select 
                        value={formData.estado_norm || ""}
                        onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, estado_norm: e.target.value as any }))}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-violet-500"
                     >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="TRABAJANDO">TRABAJANDO</option>
                        <option value="CERRADO">CERRADO</option>
                     </select>
                   </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Descripción de la Falla</h4>
              {isEditable ? (
                <textarea 
                  value={formData.descripcion || ""}
                  onChange={(e) => setFormData((prev: Partial<Correctivo>) => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full bg-black/40 rounded-2xl border border-white/5 p-4 text-sm text-white/90 leading-relaxed font-light focus:border-violet-500 outline-none h-24 resize-none"
                  placeholder="Describa el problema..."
                />
              ) : (
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-sm text-white/90 leading-relaxed font-light">
                  {item?.descripcion || "No se registró descripción del daño."}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Protocolo de Intervención</h4>
              {isEditable ? (
                <textarea 
                  value={formData.accion || ""}
                  onChange={(e) => setFormData((prev: Partial<Correctivo>) => ({ ...prev, accion: e.target.value }))}
                  className="w-full bg-violet-500/5 rounded-2xl border border-violet-500/10 p-4 text-sm text-violet-100 font-medium leading-relaxed italic focus:border-violet-500 outline-none h-24 resize-none"
                  placeholder="Detalle la acción técnica..."
                />
              ) : (
                <div className="p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10 text-sm text-violet-100 font-medium leading-relaxed italic shadow-inner">
                  {item?.accion || "Pendiente por documentar acción técnica."}
                </div>
              )}
            </div>
          </section>

          {/* Grid de especificaciones */}
          <section className="grid grid-cols-2 gap-3">
             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
               <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">Marca</span>
               {isEditable ? (
                 <input 
                   value={formData.marca || ""}
                   onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, marca: e.target.value }))}
                   className="w-full bg-transparent border-none text-xs font-semibold mt-1 text-white/80 outline-none focus:text-white"
                   placeholder="—"
                 />
               ) : (
                 <p className="text-xs font-semibold mt-1 truncate text-white/80">{formData.marca || "—"}</p>
               )}
             </div>

             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">Modelo</span>
                {isEditable ? (
                  <input 
                    value={formData.modelo || ""}
                    onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, modelo: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold mt-1 text-white/80 outline-none focus:text-white"
                    placeholder="—"
                  />
                ) : (
                  <p className="text-xs font-semibold mt-1 truncate text-white/80">{formData.modelo || "—"}</p>
                )}
             </div>

             <div className="p-3 bg-white/5 rounded-xl border border-white/10 focus-within:border-violet-500/50 transition-colors">
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">Técnico Realizador</span>
                {isEditable ? (
                  <select 
                    value={formData.tecnico || ""}
                    onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, tecnico: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold mt-1 text-white outline-none cursor-pointer [color-scheme:dark]"
                  >
                    <option value="" className="bg-[#0c111d]">Seleccione Técnico...</option>
                    {tecnicos.map(t => <option key={t} value={t} className="bg-[#0c111d]">{t}</option>)}
                    <option value="OTRO" className="bg-[#0c111d]">OTRO (Manual)</option>
                  </select>
                ) : (
                  <p className="text-xs font-semibold mt-1 truncate text-white/80">{formData.tecnico || "—"}</p>
                )}
             </div>

             <div className="p-3 bg-white/5 rounded-xl border border-white/10 focus-within:border-violet-500/50 transition-colors">
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">Causa Identificada</span>
                {isEditable ? (
                  <input 
                    value={formData.causa || ""}
                    onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, causa: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold mt-1 text-white outline-none"
                    placeholder="Escriba la causa..."
                  />
                ) : (
                  <p className="text-xs font-semibold mt-1 truncate text-white/80">{formData.causa || "—"}</p>
                )}
             </div>

             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">Fecha Cierre</span>
                {isEditable ? (
                  <input 
                    type="date"
                    value={formData.fecha_cierre ? formData.fecha_cierre.split('T')[0] : ""}
                    onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, fecha_cierre: e.target.value }))}
                    className="w-full bg-transparent border-none text-xs font-semibold mt-1 text-emerald-400 outline-none [color-scheme:dark]"
                  />
                ) : (
                  <p className="text-xs font-semibold mt-1 truncate text-emerald-400">
                    {item?.fecha_cierre ? (item.fecha_cierre.includes("T") ? item.fecha_cierre.split("T")[0] : item.fecha_cierre) : "—"}
                  </p>
                )}
             </div>

             {/* Casilla Editable para Fecha de Reporte */}
             <div className="col-span-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex-1 w-full">
                   <span className="text-[9px] uppercase font-bold tracking-widest text-blue-300">Fecha del Reporte</span>
                   <div className="flex items-center gap-2 mt-2 w-full">
                     <input 
                       type="date" 
                       value={fechaReporte}
                       onChange={(e) => setFechaReporte(e.target.value)}
                       className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 flex-1 w-full [color-scheme:dark]"
                     />
                     {!isEditable && (
                       <button
                         onClick={handleSaveChanges}
                         disabled={isSaving}
                         className="px-4 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                       >
                         {isSaving ? "..." : "Guardar"}
                       </button>
                     )}
                   </div>
                </div>
             </div>
             
             <div className="col-span-2 p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 flex items-center justify-between">
                <div>
                   <span className="text-[9px] uppercase font-bold tracking-widest text-fuchsia-300">Estado Diagnóstico</span>
                   {isEditable ? (
                     <select 
                        value={formData.estado_equipo || ""}
                        onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, estado_equipo: e.target.value }))}
                        className="w-full bg-transparent border-none text-xs font-bold text-white uppercase outline-none focus:text-white"
                     >
                        <option value="SIN REGISTRO">SIN REGISTRO</option>
                        <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                        <option value="OPERATIVO">OPERATIVO</option>
                        <option value="BAJA">BAJA</option>
                     </select>
                   ) : (
                    <p className="text-xs font-bold text-white uppercase">{formData.estado_equipo || item?.estado_equipo || "SIN REGISTRO"}</p>
                   )}
                </div>
                <div className="h-8 w-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center animate-pulse">
                   <Activity size={16} className="text-fuchsia-400" />
                </div>
             </div>
          </section>

          {/* Información técnica profunda */}
          <section className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 focus-within:border-violet-500/50 transition-colors">
                <div className="flex-1">
                   <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">N. de Serie</span>
                   {isEditable ? (
                    <input 
                      value={formData.serie || ""}
                      onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, serie: e.target.value }))}
                      className="w-full bg-transparent border-none text-sm font-mono text-violet-300 font-bold tracking-tighter outline-none focus:text-white"
                      placeholder="SIN SERIE"
                    />
                   ) : (
                    <p className="text-sm font-mono text-violet-300 font-bold tracking-tighter">{formData.serie || "SIN SERIE"}</p>
                   )}
                </div>
                <FileText size={20} className="text-white/10" />
             </div>

             <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Inventario de Repuestos / Observaciones</h4>
                {isEditable ? (
                   <textarea 
                    value={formData.observaciones || ""}
                    onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, observaciones: e.target.value }))}
                    className="w-full bg-white/5 rounded-2xl border border-white/5 p-4 text-sm text-white/70 leading-relaxed italic focus:border-violet-500 outline-none h-20 resize-none"
                    placeholder="Escriba aquí..."
                  />
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/70 leading-relaxed italic">
                    {item?.observaciones || "No se registra uso de repuestos adicionales."}
                  </div>
                )}
             </div>

             <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Bitácora de Seguimiento</h4>
                {isEditable ? (
                   <textarea 
                    value={formData.comentarios || ""}
                    onChange={e => setFormData((prev: Partial<Correctivo>) => ({ ...prev, comentarios: e.target.value }))}
                    className="w-full bg-white/5 rounded-2xl border border-white/5 p-4 text-sm text-white/70 leading-relaxed font-light focus:border-violet-500 outline-none h-20 resize-none"
                    placeholder="Escriba aquí..."
                  />
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/70 leading-relaxed font-light">
                    {item?.comentarios || "Sin comentarios de seguimiento para este reporte."}
                  </div>
                )}
             </div>

             {isEditable && (
               <div className="pt-4">
                 <button
                   onClick={handleSaveChanges}
                   disabled={isSaving}
                   className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-violet-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {isSaving ? <Activity size={18} className="animate-spin" /> : <FileText size={18} />} Guardar Cambios del Expediente
                 </button>
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
}
