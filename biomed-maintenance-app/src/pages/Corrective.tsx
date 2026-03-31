import { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, X, Search, Loader2, Activity, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Corrective = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEq, setSearchEq] = useState('');
  const [selectedEq, setSelectedEq] = useState<any | null>(null);
  const [inventoryResults, setInventoryResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Datos del reporte
  const [failureType, setFailureType] = useState('ELECTRÓNICA');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');

  // Búsqueda inteligente en Supabase
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
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(167,139,250,0.3)] tracking-wide">
            Mantenimiento Correctivo
          </h2>
          <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide tracking-wide">Órdenes de Servicio y Fallas HUSJ.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
           <AlertTriangle size={18} /> Reportar Daño
        </button>
      </header>

      <div className="flex flex-col justify-center items-center text-center bg-white/5 border border-white/10 rounded-[3rem] p-4 md:p-6 lg:p-16 backdrop-blur-2xl max-w-4xl mx-auto shadow-2xl min-h-[400px]">
         <div className="p-6 bg-violet-500/20 rounded-full mb-8 shadow-[0_0_40px_rgba(147,51,234,0.3)]">
            <Wrench size={48} className="text-violet-400" />
         </div>
         <h3 className="text-2xl text-white font-bold mb-4">Módulo de Reparaciones en Caliente</h3>
         <p className="text-white/40 max-w-lg mb-10">Genera actas inmediatas cuando un equipo sale de operación por falla técnica. El sistema notificará la indisponibilidad del activo.</p>
         <button onClick={() => setIsModalOpen(true)} className="px-10 py-4 bg-white/5 border border-violet-500/30 text-violet-300 rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-violet-500/20 transition-all">Iniciar Orden Técnica</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-gray-900 w-full max-w-3xl rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col overflow-hidden animate-in zoom-in-95">
             
             <div className="p-4 md:p-6 lg:p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                   <h3 className="text-2xl font-bold text-white">Orden de Servicio Correctivo</h3>
                   <p className="text-violet-300/60 text-xs font-bold uppercase tracking-widest mt-1">Reparación Técnica Documentada</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/50"><X /></button>
             </div>

             <div className="p-4 md:p-6 lg:p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                {!selectedEq ? (
                  <div className="space-y-4">
                     <label className="text-xs font-bold text-white/20 uppercase tracking-widest">Activo a Reparar</label>
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input value={searchEq} onChange={e => setSearchEq(e.target.value)} type="text" placeholder="Buscar equipo..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-violet-500" />
                        {inventoryResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl">
                             {inventoryResults.map(item => (
                               <div key={item.id} onClick={() => setSelectedEq(item)} className="px-6 py-4 hover:bg-violet-500/20 cursor-pointer border-b border-white/5 flex justify-between items-center text-white">
                                  <span>{item.equipo} <span className="text-white/30 text-xs ml-2">#{item.id_unico}</span></span>
                                  <span className="text-violet-400 text-xs">{item.servicio}</span>
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
                           <p className="text-xs text-violet-400 font-bold mb-1 uppercase tracking-widest">Identificado</p>
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
