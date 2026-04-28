import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, AlertTriangle, X, Search, Loader2, Activity, Calendar, BarChart3, FileText, CheckCircle2, Clock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/dateUtils';
import type { Correctivo } from '../types/corrective';
import { aplicarFiltros, kpis, barrasPorCausa, piePorEstado } from '../utils/correctiveAggregations';
import { DamageTypeBar, StatusPie, FilterBar, DetailsDrawer } from '../components/corrective/CorrectiveComponents';

// --- KPI Card ---
function KpiCard({ title, value, icon, color, delay = 0 }: { title: string, value: string | number, icon: React.ReactNode, color: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${color} opacity-50`}></div>
      <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:scale-125 duration-700">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-sm">{value}</h2>
          {title.includes('%') && <Zap size={14} className="text-yellow-400 animate-pulse" />}
        </div>
      </div>
      <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100"></div>
    </motion.div>
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
          .order('fecha_creacion', { ascending: false })
          .order('no_reporte', { ascending: false });

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
          report_id: (() => {
            const a = new Uint32Array(1);
            crypto.getRandomValues(a);
            return 'COR-' + Date.now().toString(36) + '-' + (a[0] % 10000).toString().padStart(4, '0');
          })(),
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
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10 custom-scrollbar bg-gradient-to-br from-[#0c111d] to-[#050810]">
      <div className="noise-overlay" />
      
      {/* HEADER & TABS */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black gold-glow tracking-tight">
            BIOMÉDICA <span className="text-white/20">/</span> HUSJ
          </h2>
          <p className="text-white/40 font-light mt-3 text-lg md:text-xl tracking-widest uppercase text-[10px] md:text-xs">
            <Activity size={12} className="inline mr-2 text-violet-400" />
            Sincronización en tiempo real <span className="text-emerald-400 font-bold ml-1 animate-pulse">ACTIVE</span>
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex glass-card rounded-2xl p-1.5"
        >
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'DASHBOARD' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-white/30 hover:text-white'}`}
          >
            <BarChart3 size={16} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('REPORTE')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'REPORTE' ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-white/30 hover:text-white'}`}
          >
            <AlertTriangle size={16} /> Reporte
          </button>
        </motion.div>
      </header>

      {/* ======================= TAB 1: DASHBOARD ======================= */}
      <AnimatePresence mode="wait">
        {activeTab === 'DASHBOARD' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-8"
          >
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard title="Total Labores" value={loadingDashboard ? "..." : k.total} icon={<FileText size={48} />} color="bg-cyan-500" delay={0.1} />
              <KpiCard title="Casos Cerrados" value={loadingDashboard ? "..." : k.cerrados} icon={<CheckCircle2 size={48} />} color="bg-emerald-500" delay={0.2} />
              <KpiCard title="En Proceso" value={loadingDashboard ? "..." : k.abiertos} icon={<Clock size={48} />} color="bg-amber-500" delay={0.3} />
              <KpiCard title="Eficiencia Oportuna" value={loadingDashboard ? "..." : `${k.slaPct}%`} icon={<Activity size={48} />} color="bg-violet-500" delay={0.4} />
            </div>

            <FilterBar onApplyFilter={setFilters} estados={estadosDisponibles} tecnicos={tecnicosDisponibles} />

            {/* Gráficos con Glassmorphism Profundo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-1">
                <StatusPie data={pie} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
                <DamageTypeBar data={bar} />
              </motion.div>
            </div>

            {/* Tabla con Estilo "Console" */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden">
               <div className="px-8 py-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                  <h3 className="font-black text-white/80 tracking-[0.3em] text-[10px] uppercase">Bitácora de Eventos</h3>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500/50"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
                  </div>
               </div>
               <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm border-collapse md:min-w-[800px]">
                    <thead className="bg-black/20 text-white/30 text-[9px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                      <tr>
                        <th className="px-4 md:px-8 py-5">TKT-ID</th>
                        <th className="px-6 py-5 hidden sm:table-cell">Timestamp</th>
                        <th className="px-4 md:px-6 py-5">Asset / Model</th>
                        <th className="px-6 py-5 hidden lg:table-cell">Unit</th>
                        <th className="px-4 md:px-6 py-5 text-center">Outcome</th>
                        <th className="px-4 md:px-8 py-5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredData.slice(0, 50).map((r, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 + (idx * 0.02) }}
                          key={r.no_reporte} 
                          onClick={() => setSelectedCorrectivo(r)}
                          className="hover:bg-violet-600/5 transition-all cursor-pointer group border-l-2 border-transparent hover:border-violet-600/50"
                        >
                          <td className="px-4 md:px-8 py-5 text-violet-400 font-black text-xs">
                            {r.no_reporte}
                          </td>
                          <td className="px-6 py-5 text-white/40 text-[10px] hidden sm:table-cell">
                            {r.fecha_creacion ? formatDate(r.fecha_creacion) : '—'}
                          </td>
                          <td className="px-4 md:px-6 py-5">
                             <div className="font-bold text-white/90 text-xs md:text-sm truncate max-w-[120px] md:max-w-[220px]">
                               {r.equipo || "UNSPECIFIED"}
                             </div>
                             <div className="text-[8px] font-black text-white/20 uppercase tracking-widest truncate">
                               {r.fecha_creacion ? formatDate(r.fecha_creacion) : '—'} • S/N: {r.activo_fijo || "NONE"}
                             </div>
                          </td>
                          <td className="px-6 py-5 text-white/60 hidden lg:table-cell font-light text-xs">
                            {r.servicio || "—"}
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <div className="flex justify-center">
                              <span className={`px-2 md:px-4 py-1 rounded-full border text-[8px] md:text-[9px] font-black tracking-widest uppercase inline-flex items-center justify-center min-w-[70px] md:min-w-[100px] shadow-sm ${
                                r.estado_norm === 'CERRADO' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                                r.estado_norm === 'TRABAJANDO' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                                'text-rose-400 border-rose-400/20 bg-rose-400/5'
                              }`}>
                                {r.estado_norm}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 md:px-8 py-5 text-right">
                             <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all mx-auto lg:ml-auto lg:mr-0 text-white/30">
                                <Search size={14} />
                             </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {/* ======================= TAB 2: REPORTE EXISTENTE ======================= */}
        {activeTab === 'REPORTE' && (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col justify-center items-center text-center glass-card rounded-[3rem] p-16 max-w-4xl mx-auto min-h-[500px] mt-10"
          >
             <div className="p-8 bg-fuchsia-500/10 rounded-full mb-10 border border-fuchsia-500/20 shadow-[0_0_50px_rgba(217,70,239,0.1)]">
                <Wrench size={54} className="text-fuchsia-400" />
             </div>
             <h3 className="text-3xl text-white font-black tracking-tight mb-4">Intervención en Caliente</h3>
             <p className="text-white/40 max-w-lg mb-10 text-lg leading-relaxed font-light">Acceso directo a la generación de OS para soporte correctivo de emergencia. El activo será vinculado a la base histórica de mantenimiento.</p>
             <button onClick={() => setIsModalOpen(true)} className="px-12 py-5 bg-fuchsia-600 text-white rounded-2xl font-black tracking-[0.2em] uppercase text-xs hover:scale-105 hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] transition-all flex items-center justify-center gap-3 mx-auto">
               <AlertTriangle size={18} /> Iniciar Protocolo
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= DETAILS DRAWER & MODAL ======================= */}
      <DetailsDrawer 
        open={selectedCorrectivo !== null} 
        item={selectedCorrectivo} 
        onClose={() => setSelectedCorrectivo(null)}
        tecnicos={tecnicosDisponibles}
        onUpdateItem={(updatedItem) => {
          setSelectedCorrectivo(updatedItem);
          setData(prev => prev.map(c => c.no_reporte === updatedItem.no_reporte ? updatedItem : c));
        }}
      />

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass-card w-full max-w-3xl rounded-[3rem] shadow-3xl flex flex-col overflow-hidden"
            >
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                  <div>
                     <h3 className="text-2xl font-black text-white tracking-tight">Orden de Servicio [OS]</h3>
                     <p className="text-fuchsia-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-1">Maintenance Cloud Protocol v4.0</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-white/30 transition-colors"><X size={20} /></button>
               </div>

               <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                  {!selectedEq ? (
                    <div className="space-y-6">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Búsqueda de Activo Principal</label>
                       <div className="relative">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                          <input 
                            value={searchEq} 
                            onChange={e => setSearchEq(e.target.value)} 
                            type="text" 
                            placeholder="Ingrese nombre o placa de inventario..." 
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-lg focus:border-fuchsia-500 transition-all placeholder:text-white/10" 
                          />
                          {inventoryResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-3 glass-card rounded-2xl overflow-hidden z-20">
                               {inventoryResults.map(item => (
                                 <div key={item.id} onClick={() => setSelectedEq(item)} className="px-8 py-5 hover:bg-fuchsia-500/20 cursor-pointer border-b border-white/5 flex justify-between items-center text-white">
                                     <div className="flex flex-col">
                                       <span className="font-bold text-sm tracking-tight">{item.equipo}</span>
                                       <span className="text-[10px] font-black text-white/20 uppercase">
                                         #{item.id_unico} • S/N: {item.numero_serie || '---'}
                                       </span>
                                     </div>
                                    <span className="text-fuchsia-400 font-black text-[9px] uppercase tracking-widest">{item.servicio}</span>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                       <div className="flex items-center justify-between bg-fuchsia-500/5 p-6 rounded-[2rem] border border-fuchsia-500/10">
                          <div>
                             <p className="text-[9px] text-fuchsia-400 font-black mb-1 uppercase tracking-[0.3em]">Unidad Reconocida</p>
                             <h4 className="text-white text-xl font-bold">{selectedEq.equipo}</h4>
                             <span className="text-white/20 font-black uppercase text-[10px] tracking-widest">
                               Fixed Asset: #{selectedEq.id_unico} • S/N: {selectedEq.numero_serie || '---'}
                             </span>
                          </div>
                          <button onClick={() => setSelectedEq(null)} className="px-4 py-2 bg-white/5 rounded-xl text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Volver</button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Tipo de Falla</label>
                             <select value={failureType} onChange={e => setFailureType(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white font-medium focus:border-fuchsia-500">
                                <option>ELECTRÓNICA</option>
                                <option>MECÁNICA</option>
                                <option>ACCESORIOS</option>
                                <option>SOFTWARE</option>
                                <option>OTRO</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Timeline de Evento</label>
                             <div className="p-4 bg-white/2 rounded-2xl text-white/30 text-xs flex items-center gap-3 border border-white/5">
                                <Calendar size={14} className="text-fuchsia-500" /> Registro Instantáneo
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Diagnóstico de Falla</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white text-sm focus:border-rose-500 h-28 custom-scrollbar resize-none font-light leading-relaxed" placeholder="Describa el comportamiento anómalo detectado..." />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Acción de Mitigación</label>
                          <textarea value={solution} onChange={e => setSolution(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white text-sm focus:border-emerald-500 h-28 custom-scrollbar resize-none font-light leading-relaxed" placeholder="Detalle los procedimientos técnicos ejecutados..." />
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end">
                  <button 
                    onClick={handleSaveCorrective} 
                    disabled={!selectedEq || !description || saving} 
                    className={`px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-2xl transition-all duration-500 ${selectedEq && description ? 'bg-violet-600 text-white hover:scale-105 hover:bg-violet-500 shadow-violet-500/20' : 'bg-white/2 text-white/10'}`}
                  >
                     {saving ? <Loader2 className="animate-spin" /> : <Zap size={18} />} Finalizar Protocolo Cloud
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Corrective;
