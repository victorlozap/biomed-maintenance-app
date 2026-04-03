import { useState, useEffect, useMemo } from 'react';
import { Wrench, AlertTriangle, X, Search, Loader2, Activity, Calendar, BarChart3, FileText, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Correctivo } from '../types/corrective';
import { aplicarFiltros, kpis, seriePorFecha, barrasPorCausa, piePorEstado } from '../utils/correctiveAggregations';
import { DamageTypeBar, ReportsLine, StatusPie, FilterBar, DetailsDrawer } from '../components/corrective/CorrectiveComponents';

// --- KPI Card ---
function KpiCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className={`bg-white/5 border border-white/5 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
      <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{title}</p>
      <h2 className="text-3xl font-black text-white">{value}</h2>
    </div>
  );
}

const Corrective = () => {
  const { user } = useAuth();
  
  // --- TABS ---
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REPORTE'>('DASHBOARD');

  // ================= DASHBOARD STATE =================
  const [data, setData] = useState<Correctivo[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  // Filtros Dashboard
  const [filters, setFilters] = useState({ q: "", estado: "", tecnico: "", desde: "", hasta: "" });

  const [selectedCorrectivo, setSelectedCorrectivo] = useState<Correctivo | null>(null);

  useEffect(() => {
    const fetchCorrectivos = async () => {
      setLoadingDashboard(true);
      try {
        const { data: correctivosData, error } = await supabase
          .from('correctivos_husj')
          .select('*')
          .order('fecha_creacion', { ascending: false });

        if (error) throw error;
        setData(correctivosData as Correctivo[]);
      } catch (err) {
        console.error("Error al cargar correctivos:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchCorrectivos();
  }, []);

  const estadosDisponibles = useMemo(() => Array.from(new Set(data.map(d => d.estado_norm).filter(Boolean))).sort(), [data]);
  const tecnicosDisponibles = useMemo(() => Array.from(new Set(data.map((d) => d.tecnico).filter(Boolean) as string[])).sort(), [data]);

  const filteredData = useMemo(() => aplicarFiltros(data, filters), [data, filters]);
  
  const k = useMemo(() => kpis(filteredData), [filteredData]);
  const bar = useMemo(() => barrasPorCausa(filteredData), [filteredData]);
  const line = useMemo(() => seriePorFecha(filteredData), [filteredData]);
  const pie = useMemo(() => piePorEstado(filteredData), [filteredData]);

  // ================= FORM STATE (EXISTENTE) =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEq, setSearchEq] = useState('');
  const [selectedEq, setSelectedEq] = useState<any | null>(null);
  const [inventoryResults, setInventoryResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [failureType, setFailureType] = useState('ELECTRÓNICA');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchEq.length >= 2) {
        const { data, error } = await supabase
          .from('equipments')
          .select('*')
          .or(`id_unico.ilike.%${searchEq}%,equipo.ilike.%${searchEq}%`)
          .limit(5);

        if (!error) setInventoryResults(data || []);
      } else {
        setInventoryResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchEq]);

  const handleSaveCorrective = async () => {
    if (!selectedEq || !description || !user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .insert([{
          equipment_id: selectedEq.id,
          user_id: user.id,
          report_id: 'COR-' + Math.floor(1000 + Math.random() * 9000),
          checks: { failure_type: failureType, type: 'CORRECTIVE' },
          notes: `FALLA: ${description} | SOLUCIÓN: ${solution}`,
          executed_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      alert("✅ Orden de Servicio Correctiva guardada con éxito en la nube.");
      setIsModalOpen(false);
      setSelectedEq(null);
      setDescription('');
      setSolution('');
    } catch (e: any) {
      alert("❌ Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10 custom-scrollbar">
      
      {/* HEADER & TABS */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-500">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(167,139,250,0.3)] tracking-wide">
            Gestión de Correctivos
          </h2>
          <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide">Analítica avanzada y generación de reportes HUSJ.</p>
        </div>
        
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-violet-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
            <BarChart3 size={18} /> Dashboard Analítico
          </button>
          <button 
            onClick={() => setActiveTab('REPORTE')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'REPORTE' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
            <AlertTriangle size={18} /> Crear Reporte Nube
          </button>
        </div>
      </header>

      {/* ======================= TAB 1: DASHBOARD ======================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Reportes" value={loadingDashboard ? "..." : k.total} icon={<FileText size={48} />} color="bg-cyan-400" />
            <KpiCard title="Cerrados" value={loadingDashboard ? "..." : k.cerrados} icon={<CheckCircle2 size={48} />} color="bg-emerald-400" />
            <KpiCard title="Pendientes" value={loadingDashboard ? "..." : k.abiertos} icon={<Clock size={48} />} color="bg-amber-400" />
            <KpiCard title="Oportunidad < 3 Días" value={loadingDashboard ? "..." : `${k.slaPct}%`} icon={<Activity size={48} />} color="bg-violet-400" />
          </div>

          <FilterBar onApplyFilter={setFilters} estados={estadosDisponibles} tecnicos={tecnicosDisponibles} />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <StatusPie data={pie} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DamageTypeBar data={bar} />
              <ReportsLine data={line} />
            </div>
          </div>

          {/* Tabla de Detalle */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
             <div className="p-4 md:p-6 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                <h3 className="font-bold text-white tracking-widest text-xs md:text-sm uppercase">Registros Detallados</h3>
                <span className="text-[10px] text-white/40 font-normal uppercase tracking-widest">({filteredData.length} records)</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
                  <thead className="bg-black/40 text-white/40 text-[8px] md:text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-3 md:px-6 py-4 w-12 md:w-auto">Ticket</th>
                      <th className="px-3 md:px-6 py-4 w-20 md:w-auto">Fecha</th>
                      <th className="px-3 md:px-6 py-4">Equipo / Activo</th>
                      <th className="px-3 md:px-6 py-4 hidden md:table-cell">Servicio</th>
                      <th className="px-3 md:px-6 py-4 hidden lg:table-cell">Falla</th>
                      <th className="px-3 md:px-6 py-4 text-center md:text-left">Estado</th>
                      <th className="px-3 md:px-6 py-4 w-10 md:w-auto">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredData.slice(0, 80).map((r) => (
                      <tr 
                        key={r.no_reporte} 
                        onClick={() => setSelectedCorrectivo(r)}
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <td className="px-3 md:px-6 py-4 text-violet-300 font-mono text-[9px] md:text-xs">#{r.no_reporte}</td>
                        <td className="px-3 md:px-6 py-4 text-white/50 text-[9px] md:text-xs">{r.fecha_creacion}</td>
                        <td className="px-3 md:px-6 py-4">
                           <div className="max-w-[80px] md:max-w-none truncate font-bold text-white/90 text-[10px] md:text-sm">
                             {r.equipo || "—"}
                           </div>
                           <div className="text-[7px] md:text-[10px] font-normal text-white/40 truncate">
                             {r.activo_fijo || "N/A"}
                           </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-white/70 hidden md:table-cell">{r.servicio || "—"}</td>
                        <td className="px-3 md:px-6 py-4 text-white/70 hidden lg:table-cell max-w-[150px] truncate">{r.descripcion || "—"}</td>
                        <td className="px-3 md:px-6 py-4 text-center md:text-left">
                          <div className="flex justify-center md:justify-start">
                            <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full border text-[7px] md:text-[9px] font-bold tracking-wider inline-flex items-center justify-center min-w-[50px] md:min-w-[90px] ${
                              r.estado_norm === 'CERRADO' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                              r.estado_norm === 'TRABAJANDO' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                              'text-red-400 border-red-400/20 bg-red-400/10'
                            }`}>
                              {r.estado_norm}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right">
                          <button className="p-1 md:px-4 md:py-2 bg-white/5 group-hover:bg-violet-600/30 text-white/80 rounded-lg md:rounded-xl transition-all text-[8px] md:text-xs font-bold uppercase tracking-widest border border-white/10">
                             <div className="hidden md:block">Detalle</div>
                             <div className="md:hidden">➕</div>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-white/40 shadow-inner italic">No hay registros con estos filtros.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
          
          <DetailsDrawer 
            open={selectedCorrectivo !== null} 
            item={selectedCorrectivo} 
            onClose={() => {
              console.log("Cerrando drawer");
              setSelectedCorrectivo(null);
            }} 
          />
        </div>
      )}

      {/* Debug Visual para Producción */}
      {selectedCorrectivo && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white p-2 rounded text-[8px] animate-pulse">
            DEBUG: Drawer Activo para #{selectedCorrectivo.no_reporte}
        </div>
      )}

      {/* ======================= TAB 2: REPORTE EXISTENTE ======================= */}
      {activeTab === 'REPORTE' && (
        <div className="flex flex-col justify-center items-center text-center bg-white/5 border border-white/10 rounded-[3rem] p-4 md:p-6 lg:p-16 backdrop-blur-2xl max-w-4xl mx-auto shadow-2xl min-h-[500px] animate-in zoom-in-95 duration-500 mt-10">
           <div className="p-6 bg-violet-500/20 rounded-full mb-8 shadow-[0_0_40px_rgba(147,51,234,0.3)]">
              <Wrench size={48} className="text-violet-400" />
           </div>
           <h3 className="text-2xl text-white font-bold mb-4">Módulo de Reparaciones en Caliente</h3>
           <p className="text-white/40 max-w-lg mb-10">Genera actas inmediatas de intervención cloud cuando un equipo requiera atención correctiva presencial. El registro irá a tu base relacional de actividades.</p>
           <button onClick={() => setIsModalOpen(true)} className="px-10 py-4 bg-white/5 border border-violet-500/30 text-violet-300 rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-violet-500/20 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2 mx-auto">
             <AlertTriangle size={16} /> Iniciar Orden de Servicio
           </button>
        </div>
      )}

      {/* ======================= MODAL REPORTE ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-gray-900 w-full max-w-3xl rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col overflow-hidden animate-in zoom-in-95">
             
             <div className="p-4 md:p-6 lg:p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                   <h3 className="text-2xl font-bold text-white">Orden de Servicio Correctivo</h3>
                   <p className="text-violet-300/60 text-xs font-bold uppercase tracking-widest mt-1">Reparación Técnica Documentada Nube</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/50"><X /></button>
             </div>

             <div className="p-4 md:p-6 lg:p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                {!selectedEq ? (
                  <div className="space-y-4">
                     <label className="text-xs font-bold text-white/20 uppercase tracking-widest">Activo a Reparar</label>
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input value={searchEq} onChange={e => setSearchEq(e.target.value)} type="text" placeholder="Buscar equipo relacional activo..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-violet-500" />
                        {inventoryResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl">
                             {inventoryResults.map(item => (
                               <div key={item.id} onClick={() => setSelectedEq(item)} className="px-6 py-4 hover:bg-violet-500/20 cursor-pointer border-b border-white/5 flex justify-between items-center text-white">
                                  <span>{item.equipo} <span className="text-white/30 text-xs ml-2">#{item.id_unico}</span></span>
                                  <span className="text-violet-400 text-[10px]">{item.servicio}</span>
                               </div>
                             ))}
                          </div>
                        )}
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in">
                     <div className="flex items-center justify-between bg-violet-500/10 p-5 rounded-2xl border border-violet-500/20">
                        <div>
                           <p className="text-xs text-violet-400 font-bold mb-1 uppercase tracking-widest">Identificado (Relacional)</p>
                           <h4 className="text-white font-bold">{selectedEq.equipo} <span className="text-white/40 ml-2">#{selectedEq.id_unico}</span></h4>
                        </div>
                        <button onClick={() => setSelectedEq(null)} className="text-violet-300 text-xs underline">Cambiar Equipo</button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                           <label className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2 block">Tipo de Falla</label>
                           <select value={failureType} onChange={e => setFailureType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 font-light">
                              <option>ELECTRÓNICA</option>
                              <option>MECÁNICA</option>
                              <option>ACCESORIOS</option>
                              <option>SOFTWARE</option>
                              <option>OTRO</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2 block">Fecha de Intervención</label>
                           <div className="p-3 bg-black/20 rounded-xl text-white/60 text-sm flex items-center gap-2 italic">
                              <Calendar size={14} /> Fecha Actual del Sistema
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-white/30 font-bold uppercase tracking-widest block">Descripción del Daño</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-rose-500 h-24" placeholder="Ej: No enciende, pantalla rota, error de sensado..." />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-white/30 font-bold uppercase tracking-widest block">Actividades de Solución</label>
                        <textarea value={solution} onChange={e => setSolution(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-emerald-500 h-24" placeholder="Ej: Se reemplaza cable AC, se calibra tarjeta de potencia..." />
                     </div>
                  </div>
                )}
             </div>

             <div className="p-4 md:p-6 lg:p-8 border-t border-white/10 bg-black/60 flex justify-end">
                <button onClick={handleSaveCorrective} disabled={!selectedEq || !description || saving} className={`px-12 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl transition-all ${selectedEq && description ? 'bg-violet-600 text-white hover:scale-105' : 'bg-white/5 text-white/20'}`}>
                   {saving ? <Loader2 className="animate-spin" /> : <Activity size={20} />} Finalizar y Guardar Reporte Cloud
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Corrective;
