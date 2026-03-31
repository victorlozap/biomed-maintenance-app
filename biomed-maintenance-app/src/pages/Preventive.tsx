import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, FileText, Search, X, Activity, Save, AlertCircle, Loader2 } from 'lucide-react';
import { generateProtocolPDF } from '../utils/pdfGenerator';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import protocolsData from '../data/protocols.json';

const protocols = protocolsData as Record<string, any>;

const Preventive = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEq, setSearchEq] = useState('');
  const [selectedEq, setSelectedEq] = useState<any | null>(null);
  const [inventoryResults, setInventoryResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [activeProtocol, setActiveProtocol] = useState<any | null>(null);
  const [checkValues, setCheckValues] = useState<Record<string, string>>({});
  const [numericValues, setNumericValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  // Búsqueda en Supabase en lugar de archivo local
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchEq.length >= 2) {
        setLoadingSearch(true);
        const { data, error } = await supabase
          .from('equipments')
          .select('*')
          .or(`id_unico.ilike.%${searchEq}%,equipo.ilike.%${searchEq}%`)
          .limit(5);

        if (!error) setInventoryResults(data || []);
        setLoadingSearch(false);
      } else {
        setInventoryResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchEq]);

  // Detector lógico de protocolos
  useEffect(() => {
    if (selectedEq) {
      const eqName = String(selectedEq.equipo || '').toUpperCase();
      let matched = null;
      if (eqName.includes('MONITOR')) {
        matched = protocols['MONITOR'];
      } else if (eqName.includes('DESFIBRILADOR')) {
        matched = protocols['DESFIBRILADOR'];
      } else if (
        eqName.includes('VENTILADOR') || 
        eqName.includes('BLENDER') || 
        eqName.includes('NEOPUFF') ||
        eqName.includes('REANIMADOR NEONATAL')
      ) {
        matched = protocols['VENTILADOR_NEOPUFF_BLENDER'];
      } else if (
        eqName.includes('VACUTRON') || 
        eqName.includes('ASPIRADOR') || 
        eqName.includes('FLUJO') || 
        eqName.includes('CONCENTRADOR') || 
        eqName.includes('REGULADOR') ||
        eqName.includes('OXIGENO')
      ) {
        matched = protocols['FLUJOMETRO'];
      }
      
      if (matched) {
        setActiveProtocol(matched);
        const newChecks: any = {};
        matched.items.forEach((i: any) => newChecks[i.id] = 'cumple');
        setCheckValues(newChecks);
        
        const newNumerics: any = {};
        if (matched.numeric_items) {
           matched.numeric_items.forEach((i: any) => newNumerics[i.id] = '');
        }
        setNumericValues(newNumerics);
      } else {
        setActiveProtocol(null);
      }
    }
  }, [selectedEq]);

  const handleSaveAndGenerate = async () => {
    if (!selectedEq || !activeProtocol || !user) return;
    
    setSaving(true);
    const reportId = 'PM-' + Math.floor(1000 + Math.random() * 9000);

    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .insert([{
          equipment_id: selectedEq.id,
          user_id: user.id,
          report_id: reportId,
          checks: checkValues,
          numeric_values: numericValues,
          notes: notes,
          executed_at: maintenanceDate
        }]);

      if (error) throw error;

      await generateProtocolPDF(
        activeProtocol, 
        selectedEq, 
        checkValues, 
        numericValues, 
        notes, 
        reportId,
        maintenanceDate
      );

      alert(`✅ Acta de Mantenimiento GRF generada con éxito.`);
      setIsModalOpen(false);
      setSelectedEq(null);
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
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-wide">
            Protocolos Preventivos
          </h2>
          <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide uppercase flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" /> Sincronización HUSJ
          </p>
        </div>
      </header>

      <div className="flex flex-col justify-center items-center text-center group bg-white/5 border border-white/10 rounded-3xl p-4 md:p-8 lg:p-12 backdrop-blur-2xl max-w-4xl mx-auto shadow-2xl min-h-[350px]">
        <FileText size={48} className="text-emerald-500/50 mb-6 group-hover:-translate-y-2 transition-transform" />
        <h4 className="text-2xl text-white/90 font-medium mb-3">Ejecutar Formato Centralizado</h4>
        <p className="text-white/50 mb-8 max-w-xl">Los reportes se guardarán automáticamente en la nube.</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:scale-105 transition-all shadow-lg"
        >
          <CheckCircle size={20} className="inline mr-2" /> Iniciar Mantenimiento
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-gray-900/95 backdrop-blur-3xl border-l border-white/10 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 md:p-6 lg:p-8 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h3 className="text-2xl font-bold text-white">Manual de Ejecución</h3>
              {activeProtocol && <p className="text-emerald-400 text-xs font-bold mt-1 uppercase tracking-widest">{activeProtocol.code} - VER. {activeProtocol.version}</p>}
            </div>
            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-32 custom-scrollbar">
            {!selectedEq ? (
              <div className="space-y-4">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Identificar Equipo en Nube</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="Escribe Placa o Nombre..." 
                    value={searchEq}
                    onChange={(e) => setSearchEq(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 transition-all font-light"
                  />
                  {(loadingSearch || inventoryResults.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl">
                      {loadingSearch ? <div className="p-4 text-center text-white/40"><Loader2 className="animate-spin inline mr-2" /> buscando...</div> : 
                        inventoryResults.map(item => (
                          <div key={item.id} onClick={() => setSelectedEq(item)} className="px-6 py-4 hover:bg-emerald-500/10 cursor-pointer border-b border-white/5 flex justify-between items-center text-white">
                             <div>
                                <p className="text-white font-medium">{item.equipo}</p>
                                <p className="text-white/40 text-xs uppercase">{item.marca} - {item.servicio}</p>
                             </div>
                             <span className="text-emerald-400 font-mono">#{item.id_unico}</span>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex justify-between items-center text-white">
                   <div>
                      <p className="text-emerald-400 text-xs font-bold tracking-widest mb-1 uppercase">Equipo Seleccionado</p>
                      <h4 className="text-xl text-white font-bold">{selectedEq.equipo} <span className="text-white/40 ml-2">#{selectedEq.id_unico}</span></h4>
                   </div>
                   <button onClick={() => setSelectedEq(null)} className="text-emerald-300 text-sm underline hover:text-white">Cambiar</button>
                </div>

                {activeProtocol ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 text-white">
                       <span className="text-white/40 text-xs uppercase font-bold flex items-center gap-2">
                           <Calendar size={14} className="text-emerald-400" /> Fecha Mantenimiento
                       </span>
                       <input type="date" value={maintenanceDate} onChange={e => setMaintenanceDate(e.target.value)} className="bg-black/40 border border-white/20 rounded px-3 py-1 text-white text-sm invert" />
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Parámetros de Revisión</p>
                       {activeProtocol.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-white">
                             <p className="text-white/80 text-sm flex-1 pr-4">{item.label}</p>
                             <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                <button onClick={() => setCheckValues({...checkValues, [item.id]: 'cumple'})} className={`px-3 py-1.5 rounded-md text-[9px] font-bold ${checkValues[item.id] === 'cumple' ? 'bg-emerald-500/40 text-emerald-300' : 'text-white/20'}`}>CUMPLE</button>
                                <button onClick={() => setCheckValues({...checkValues, [item.id]: 'nc'})} className={`px-3 py-1.5 rounded-md text-[9px] font-bold mx-1 ${checkValues[item.id] === 'nc' ? 'bg-rose-500/40 text-rose-300' : 'text-white/20'}`}>N.C</button>
                                <button onClick={() => setCheckValues({...checkValues, [item.id]: 'na'})} className={`px-3 py-1.5 rounded-md text-[9px] font-bold ${checkValues[item.id] === 'na' ? 'bg-white/10 text-white/50' : 'text-white/20'}`}>N.A</button>
                             </div>
                          </div>
                       ))}
                    </div>

                    {activeProtocol.numeric_items && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Mediciones Analizador</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                           {activeProtocol.numeric_items.map((item: any) => (
                              <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 text-white">
                                 <label className="text-[10px] text-white/40 block mb-2">{item.label}</label>
                                 <input type="text" value={numericValues[item.id] || ''} onChange={e => setNumericValues({...numericValues, [item.id]: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-amber-500 transition-all" placeholder="0.00" />
                              </div>
                           ))}
                        </div>
                      </div>
                    )}

                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones técnicas finales..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-emerald-500 transition-all h-24" />
                  </div>
                ) : (
                  <div className="p-12 text-center border border-white/5 rounded-3xl bg-white/5">
                     <AlertCircle className="text-amber-500 mx-auto mb-4" size={32} />
                     <h4 className="text-white font-bold">Equipo sin Protocolo Digitalizado</h4>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 border-t border-white/10 bg-black/80 flex justify-end">
             <button 
                onClick={handleSaveAndGenerate}
                disabled={!selectedEq || !activeProtocol || saving}
                className={`px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl ${selectedEq && activeProtocol ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
             >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Consolidar y Firmar acta digital
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preventive;
