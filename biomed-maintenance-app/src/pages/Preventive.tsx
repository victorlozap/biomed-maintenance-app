import { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, FileText, Search, X, Activity, Save, AlertCircle } from 'lucide-react';
import { generateProtocolPDF } from '../utils/pdfGenerator';
import rawInventoryData from '../data/inventory.json';
import protocolsData from '../data/protocols.json';

const inventoryData = rawInventoryData as any[];
const protocols = protocolsData as Record<string, any>;

const Preventive = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEq, setSearchEq] = useState('');
  const [selectedEq, setSelectedEq] = useState<any | null>(null);
  const [localInventory, setLocalInventory] = useState<any[]>(inventoryData);
  const [maintenanceDate, setMaintenanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('custom_inventory');
    if (saved) {
      try {
        const customEquipments = JSON.parse(saved);
        setLocalInventory([...customEquipments, ...inventoryData]);
      } catch(e) {}
    }
  }, []);

  const [activeProtocol, setActiveProtocol] = useState<any | null>(null);
  const [checkValues, setCheckValues] = useState<Record<string, string>>({});
  const [numericValues, setNumericValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const searchResults = useMemo(() => {
    if (!searchEq || searchEq.length < 2) return [];
    const lowerQ = searchEq.toLowerCase();
    return localInventory.filter(i => {
      if (!i || typeof i !== 'object') return false;
      return String(i['Id_Unico'] || '').toLowerCase().includes(lowerQ) ||
             String(i['Equipo'] || '').toLowerCase().includes(lowerQ);
    }).slice(0, 5);
  }, [searchEq, localInventory]);

  // When equipment is selected, determine its protocol
  useEffect(() => {
    if (selectedEq) {
      const eqName = String(selectedEq['Equipo']).toUpperCase();
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
        // Reset state with default values
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

  const handleSelectEquipment = (equip: any) => {
    setSelectedEq(equip);
    setSearchEq('');
  };

  const setCheck = (id: string, val: string) => {
    setCheckValues(p => ({ ...p, [id]: val }));
  };

  const setNumeric = (id: string, val: string) => {
    setNumericValues(p => ({ ...p, [id]: val }));
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto h-screen relative z-10">
      <header className="mb-12 flex justify-between items-end backdrop-blur-sm">
        <div>
          <h2 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-wide">
            Protocolos Preventivos Oficiales
          </h2>
          <p className="text-white/60 font-light mt-3 text-lg tracking-wide">
            Digitalización Dinámica de Plantillas GRF3MAN.
          </p>
        </div>
      </header>

      <div className="flex flex-col justify-center items-center text-center group overflow-hidden relative bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-2xl xl max-w-4xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-h-[400px]">
        <FileText size={48} className="text-emerald-500/50 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] mb-6 transform group-hover:-translate-y-2 transition-transform duration-500" />
        <h4 className="text-2xl text-white/90 font-medium mb-3">Ejecutar Mantenimiento Pre-Cargado</h4>
        <p className="text-white/50 font-light text-base max-w-xl mb-8 leading-relaxed">
          Selección Dinámica: Al buscar tu equipo, el sistema cargará automáticamente todos los parámetros técnicos y de seguridad eléctrica correspondientes a la versión vigente.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 text-emerald-300 font-medium transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] flex items-center gap-3 hover:scale-105"
          >
            <CheckCircle size={20} /> Buscar Equipo / Iniciar Formato
          </button>
        </div>
      </div>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-gray-900/90 backdrop-blur-3xl border-l border-white/10 z-50 shadow-2xl flex flex-col transition-all">
            <div className="p-8 border-b border-white/10 flex justify-between items-center relative z-10 bg-black/30">
              <div>
                <h3 className="text-2xl font-semibold text-white">Ejecución de Protocolo</h3>
                {activeProtocol && (
                  <p className="text-emerald-400 font-medium mt-1 text-sm tracking-widest uppercase flex items-center gap-2">
                    <Activity size={14} /> {activeProtocol.code} - VERSIÓN {activeProtocol.version}
                  </p>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full">
                 <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar pb-32">
              {!selectedEq ? (
                <div className="mb-10 text-left">
                  <h4 className="text-lg text-white/90 font-medium mb-4">Selección de Equipo y Despliegue de Plantilla</h4>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input 
                      type="text" 
                      placeholder="Busca por 'Monitor', 'Desfibrilador' o placa..." 
                      value={searchEq}
                      onChange={(e) => setSearchEq(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden z-20">
                        {searchResults.map((item, idx) => (
                          <div key={idx} onClick={() => handleSelectEquipment(item)} className="px-6 py-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0">
                            <p className="text-white font-medium">{item['Equipo']} <span className="text-emerald-400 font-light ml-2">#{item['Id_Unico']}</span></p>
                            <p className="text-white/40 text-xs uppercase tracking-widest mt-1">{item['Marca']} - {item['UBICACIÓN'] || item['Servicio']}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex justify-between items-center mb-6">
                    <div>
                         <p className="text-emerald-400 text-xs font-bold tracking-widest mb-1">#{selectedEq['Id_Unico']}</p>
                         <h4 className="text-xl text-white font-medium">{selectedEq['Equipo']}</h4>
                    </div>
                    <button onClick={() => {setSelectedEq(null); setActiveProtocol(null);}} className="text-emerald-300 hover:text-white text-sm underline">Clasificar otro</button>
                  </div>
                  
                  {activeProtocol ? (
                    <div>
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <FileText className="text-emerald-400" size={20} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{activeProtocol.title}</h4>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest">{activeProtocol.code} - Ver. {activeProtocol.version}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Calendar size={12} className="text-emerald-400" /> Fecha de Ejecución
                          </label>
                          <input 
                            type="date" 
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                            className="bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer invert brightness-200"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                         {activeProtocol.items.map((item: any) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors gap-4">
                              <p className="text-white/80 text-sm leading-relaxed flex-1">{item.label}</p>
                              <div className="flex bg-black/40 rounded-lg p-1 shrink-0 h-10">
                                <button onClick={() => setCheck(item.id, 'cumple')} className={`px-4 rounded-md text-[10px] tracking-widest font-bold ${checkValues[item.id] === 'cumple' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'text-white/40'}`}>CUMPLE</button>
                                <button onClick={() => setCheck(item.id, 'nc')} className={`px-4 rounded-md text-[10px] tracking-widest font-bold mx-1 ${checkValues[item.id] === 'nc' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'text-white/40'}`}>N.C</button>
                                <button onClick={() => setCheck(item.id, 'na')} className={`px-4 rounded-md text-[10px] tracking-widest font-bold ${checkValues[item.id] === 'na' ? 'bg-slate-500/30 text-slate-300 border border-slate-500/50' : 'text-white/40'}`}>N.A</button>
                              </div>
                            </div>
                         ))}
                      </div>

                      {activeProtocol.numeric_items && activeProtocol.numeric_items.length > 0 && (
                        <div className="mt-10">
                           <h5 className="text-lg text-amber-400 font-medium mb-6">Pruebas Físicas y Analizador</h5>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {activeProtocol.numeric_items.map((item: any) => (
                               <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                  <label className="block text-white/70 text-xs mb-2">{item.label}</label>
                                  <input 
                                    type="text" 
                                    value={numericValues[item.id] || ''} 
                                    onChange={e => setNumeric(item.id, e.target.value)}
                                    placeholder="Valor medido..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                  />
                               </div>
                             ))}
                           </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white/5 border border-white/10 rounded-2xl">
                       <AlertCircle className="text-amber-500 mx-auto mb-4" size={32} />
                       <h4 className="text-white text-lg">No hay formato GRF digitalizado para "{selectedEq['Equipo']}"</h4>
                       <p className="text-white/40 mt-2">Por favor selecciona un Monitor de Signos o Desfibrilador.</p>
                    </div>
                  )}

                  <div className="mt-8 border-t border-white/10 pt-8">
                     <h4 className="text-lg text-white/90 mb-4">Observaciones Institucionales</h4>
                     <textarea 
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Observaciones formales para el acta..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-light focus:border-emerald-400/50 resize-none"
                      ></textarea>
                  </div>

                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black/80 flex justify-end gap-4 z-20">
              <button 
                disabled={!selectedEq || !activeProtocol}
                onClick={async () => {
                  try {
                    const reportId = 'PM-' + Math.floor(1000 + Math.random() * 9000);
                    await generateProtocolPDF(
                      activeProtocol, 
                      selectedEq, 
                      checkValues, 
                      numericValues, 
                      notes, 
                      reportId,
                      maintenanceDate
                    );
                    alert(`✅ Acta de Mantenimiento GRF (${activeProtocol.code}) generada desde JSON con éxito.`);
                    setIsModalOpen(false);
                  } catch (e: any) {
                    alert("⚠️ Error generando PDF: " + String(e.message||e));
                  }
                }}
                className={`px-8 py-3 rounded-2xl font-medium shadow-2xl flex items-center gap-2 ${selectedEq && activeProtocol ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
              >
                <Save size={18} /> Consolidar y Descargar PDF Estándar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Preventive;
