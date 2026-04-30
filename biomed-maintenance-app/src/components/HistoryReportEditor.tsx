import { useState, useEffect } from 'react';
import { X, Save, Download, Loader2, CheckCircle, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateProtocolPDF } from '../utils/pdfGenerator';
import { generateCorrectivePDF } from '../utils/pdfCorrectiveGenerator';
import { useAuth } from '../contexts/AuthContext';
import protocolsData from '../data/protocols.json';

const protocols = protocolsData as Record<string, any>;

interface HistoryReportEditorProps {
  item: any;
  equipment: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const HistoryReportEditor = ({ item, equipment, onClose, onUpdate }: HistoryReportEditorProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Preventive states
  const [activeProtocol, setActiveProtocol] = useState<any | null>(null);
  const [checkValues, setCheckValues] = useState<Record<string, string>>({});
  const [numericValues, setNumericValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [reportDate, setReportDate] = useState('');

  // Corrective (correctivos_husj) states
  const [correctiveData, setCorrectiveData] = useState<any>(null);

  useEffect(() => {
    if (item.table === 'maintenance_logs') {
      const raw = item.raw;
      setNotes(raw.notes || '');
      setReportDate(raw.executed_at ? raw.executed_at.split('T')[0] : '');
      setCheckValues(raw.checks || {});
      setNumericValues(raw.numeric_values || {});

      // Auto-detect protocol for Preventive
      if (item.type === 'PREVENTIVO') {
        detectProtocol(equipment);
      }
    } else if (item.table === 'correctivos_husj') {
      setCorrectiveData({ ...item.raw });
    }
  }, [item, equipment]);

  const detectProtocol = (eq: any) => {
    const rawName = String(eq.equipo || '').toUpperCase();
    const eqName = rawName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let matched = null;
    if (eqName.includes('MONITOR') || eqName.includes('ELECTROCARDIOGRAFO')) {
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
    } else if (eqName.includes('BASCULA') || eqName.includes('BALANZA')) {
      matched = protocols['BASCULA'];
    } else if (eqName.includes('CAMA') || eqName.includes('CUNA') || eqName.includes('SILLA ELECTRICA')) {
      matched = protocols['CAMA'];
    } else if (eqName.includes('ELECTROBISTURI') || eqName.includes('ELECTROCAUTERIO')) {
      matched = protocols['ELECTROBISTURI'];
    } else if (eqName.includes('INCUBADORA')) {
      matched = protocols['INCUBADORA'];
    } else if (eqName.includes('LARINGOSCOPIO')) {
      matched = protocols['LARINGOSCOPIO'];
    } else if (
      eqName.includes('LAMPARA') || 
      eqName.includes('CIELITICA') || 
      eqName.includes('CUELLO DE CISNE') || 
      eqName.includes('AUXILIAR') || 
      eqName.includes('QUIRURGICA')
    ) {
      matched = protocols['LAMPARA_QUIRURGICA'];
    } else if (
      eqName.includes('PANEL') || 
      eqName.includes('COLUMNA') || 
      eqName.includes('BRAZO ARQUITECTONICO')
    ) {
      matched = protocols['PANELES_COLUMNAS_BRAZOS'];
    }
    
    if (matched) {
      setActiveProtocol(matched);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (item.table === 'maintenance_logs') {
        const { error } = await supabase
          .from('maintenance_logs')
          .update({
            checks: checkValues,
            numeric_values: numericValues,
            notes: notes,
            executed_at: reportDate
          })
          .eq('id', item.id);

        if (error) throw error;
      } else if (item.table === 'correctivos_husj') {
        const { error } = await supabase
          .from('correctivos_husj')
          .update(correctiveData)
          .eq('no_reporte', item.report_id);

        if (error) throw error;
      }
      
      alert('✅ Reporte actualizado con éxito.');
      onUpdate();
      onClose();
    } catch (err: any) {
      alert('❌ Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePDF = async () => {
    if (item.table === 'correctivos_husj') {
        try {
          setLoading(true);
          await generateCorrectivePDF(
            correctiveData,
            equipment,
            user?.email || ''
          );
        } catch (err) {
          console.error("Error generating corrective PDF:", err);
          alert("Error al generar el PDF del correctivo.");
        } finally {
          setLoading(false);
        }
        return;
    }

    if (item.type !== 'PREVENTIVO' || !activeProtocol) {
        alert('Este reporte no corresponde a un Mantenimiento Preventivo con protocolo digital.');
        return;
    }
    
    try {
      setLoading(true);
      await generateProtocolPDF(
        activeProtocol, 
        equipment, 
        checkValues, 
        numericValues, 
        notes, 
        item.report_id,
        reportDate,
        user?.email || ''
      );
    } catch (err) {
      console.error("Error regenerating PDF:", err);
      alert("Error al generar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative w-full h-full md:h-[90vh] md:max-w-4xl bg-[#0c111d] md:border border-white/10 md:rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border ${item.type === 'CORRECTIVO' ? 'bg-rose-500/20 border-rose-500/20 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400'}`}>
               {item.type === 'CORRECTIVO' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Editor de Reporte Técnico</h3>
              <p className="text-violet-400 text-[10px] font-bold tracking-[0.3em] mt-1 italic">
                #{item.report_id} • {item.type} • {item.table.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(item.type === 'PREVENTIVO' || item.table === 'correctivos_husj') && (
              <button 
                onClick={handleRegeneratePDF}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${item.table === 'correctivos_husj' ? 'from-rose-500 to-rose-600' : 'from-orange-500 to-amber-500'} text-white rounded-xl text-xs font-bold uppercase transition-all hover:scale-105 shadow-lg shadow-rose-500/20`}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} 
                {item.table === 'correctivos_husj' ? 'Generar Reporte FR134' : 'Regenerar PDF'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/30 transition-colors">
              <X size={24} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          
          {/* Info del Equipo vinculada */}
          <section className="bg-white/5 rounded-3xl p-6 border border-white/5">
             <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                <Activity size={20} className="text-violet-400" />
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Información del Activo</h4>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase mb-1">Equipo</p>
                  <p className="text-white font-medium text-sm">{equipment.equipo}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase mb-1">Placa</p>
                  <p className="text-orange-400 font-mono text-sm">#{equipment.id_unico}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase mb-1">Marca / Modelo</p>
                  <p className="text-white/60 text-xs">{equipment.marca} / {equipment.modelo}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase mb-1">Servicio</p>
                  <p className="text-white/60 text-xs">{equipment.servicio}</p>
                </div>
             </div>
          </section>

          {/* Formulario Dinámico según Tipo */}
          {item.type === 'PREVENTIVO' && activeProtocol ? (
            <div className="space-y-8">
               <div className="flex justify-between items-center bg-white/2 p-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-400" /> Fecha del reporte
                 </span>
                 <input 
                    type="date" 
                    value={reportDate} 
                    onChange={e => setReportDate(e.target.value)} 
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-all invert" 
                 />
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Puntos de Inspección Protocolo: {activeProtocol.code}</h4>
                  <div className="grid grid-cols-1 gap-3">
                     {activeProtocol.items.map((pi: any) => (
                        <div key={pi.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all gap-4">
                           <p className="text-white/80 text-xs flex-1 pr-4">{pi.label}</p>
                           <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 self-end md:self-auto">
                              {['cumple', 'nc', 'na'].map((status) => (
                                <button 
                                  key={status}
                                  onClick={() => setCheckValues({...checkValues, [pi.id]: status})} 
                                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    checkValues[pi.id] === status 
                                      ? (status === 'cumple' ? 'bg-emerald-500/30 text-emerald-300' : status === 'nc' ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10 text-white/50')
                                      : 'text-white/10 hover:text-white/30'
                                  }`}
                                >
                                  {status === 'cumple' ? 'CUMPLE' : status === 'nc' ? 'N.C.' : 'N.A.'}
                                </button>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {activeProtocol.numeric_items && activeProtocol.numeric_items.length > 0 && (
                 <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-amber-400/50 uppercase tracking-widest">Mediciones Técnicas</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProtocol.numeric_items.map((ni: any) => (
                        <div key={ni.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                           <label className="text-[9px] text-white/30 block mb-2 uppercase font-bold">{ni.label}</label>
                           <input 
                              type="text" 
                              value={numericValues[ni.id] || ''} 
                              onChange={e => setNumericValues({...numericValues, [ni.id]: e.target.value})} 
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-amber-500 transition-all font-mono" 
                              placeholder="0.00" 
                           />
                        </div>
                      ))}
                   </div>
                 </div>
               )}

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Observaciones Técnicas</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value.toUpperCase())} 
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:border-emerald-500 h-32 custom-scrollbar resize-none font-light leading-relaxed" 
                    placeholder="Escriba aquí..." 
                  />
               </div>
            </div>
          ) : item.table === 'correctivos_husj' && correctiveData ? (
            <div className="space-y-6">
                {/* --- CABECERA DE TIEMPOS Y UBICACIÓN --- */}
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-6">
                  <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4">Información de Tiempo y Ubicación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Fecha Inicio</label>
                      <input 
                        type="date" 
                        value={correctiveData.fecha_creacion?.split('T')[0] || ''} 
                        onChange={e => setCorrectiveData({...correctiveData, fecha_creacion: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Hora Inicio</label>
                      <input 
                        type="time" 
                        value={correctiveData.metadata?.tiempos?.inicio || ''} 
                        onChange={e => setCorrectiveData({
                          ...correctiveData, 
                          metadata: { ...correctiveData.metadata, tiempos: { ...(correctiveData.metadata?.tiempos || {}), inicio: e.target.value } }
                        })} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Fecha Fin</label>
                      <input 
                        type="date" 
                        value={correctiveData.fecha_cierre?.split('T')[0] || ''} 
                        onChange={e => setCorrectiveData({...correctiveData, fecha_cierre: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Hora Fin</label>
                      <input 
                        type="time" 
                        value={correctiveData.metadata?.tiempos?.fin || ''} 
                        onChange={e => setCorrectiveData({
                          ...correctiveData, 
                          metadata: { ...correctiveData.metadata, tiempos: { ...(correctiveData.metadata?.tiempos || {}), fin: e.target.value } }
                        })} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Piso</label>
                      <input 
                        placeholder="Ej: 1, 2, 3..."
                        value={correctiveData.metadata?.piso || ''} 
                        onChange={e => setCorrectiveData({...correctiveData, metadata: { ...correctiveData.metadata, piso: e.target.value }})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Tipo de Contrato</label>
                      <select 
                        value={correctiveData.metadata?.contrato || 'Mantenimiento'} 
                        onChange={e => setCorrectiveData({...correctiveData, metadata: { ...correctiveData.metadata, contrato: e.target.value }})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none"
                      >
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Arriendo">Arriendo</option>
                        <option value="Comodato">Comodato</option>
                        <option value="Garantía">Garantía</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* --- CHECKLIST TÉCNICO --- */}
                <div className="p-6 bg-violet-500/5 rounded-[2rem] border border-violet-500/10">
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Activity size={12} /> Matriz de Revisión Técnica (Checklist)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { id: 'limpieza', label: 'Limpieza Integral' },
                      { id: 'bateria', label: 'Batería Interna' },
                      { id: 'optico', label: 'Sistema Óptico' },
                      { id: 'impresora', label: 'Impresora' },
                      { id: 'operacion', label: 'Op. General' },
                      { id: 'neumatico', label: 'Sist. Neumático' },
                      { id: 'hidraulico', label: 'Sist. Hidráulico' },
                      { id: 'alarmas', label: 'Alarmas' },
                      { id: 'autotest', label: 'Autotest' },
                      { id: 'electronico', label: 'Sist. Electrónico' },
                      { id: 'mecanico', label: 'Sist. Mecánico' },
                      { id: 'accesorios', label: 'Accesorios' },
                      { id: 'pantalla', label: 'Pantalla (Display)' },
                      { id: 'sist_electrico', label: 'Sist. Eléctrico' },
                      { id: 'respaldo', label: 'Sist. Respaldo (Bat.)' },
                      { id: 'software', label: 'Software' },
                    ].map(task => (
                      <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={correctiveData.metadata?.checklist?.[task.id] || false}
                          onChange={e => {
                            const newChecklist = { ...(correctiveData.metadata?.checklist || {}), [task.id]: e.target.checked };
                            setCorrectiveData({ ...correctiveData, metadata: { ...correctiveData.metadata, checklist: newChecklist } });
                          }}
                          className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-rose-500 focus:ring-0 transition-all"
                        />
                        <span className="text-[11px] text-white/60 group-hover:text-white transition-colors uppercase tracking-wider">{task.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Técnico Responsable</label>
                    <input 
                       value={correctiveData.tecnico || ''} 
                       onChange={e => setCorrectiveData({...correctiveData, tecnico: e.target.value.toUpperCase()})} 
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Procedimiento</label>
                    <select 
                      value={correctiveData.metadata?.procedimiento || 'Correctivo'} 
                      onChange={e => setCorrectiveData({...correctiveData, metadata: { ...correctiveData.metadata, procedimiento: e.target.value }})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 outline-none"
                    >
                      <option value="Correctivo">Correctivo</option>
                      <option value="Diagnóstico">Diagnóstico</option>
                      <option value="Instalación">Instalación</option>
                      <option value="Seguimiento">Seguimiento</option>
                      <option value="Preventivo">Preventivo</option>
                      <option value="Alistamiento">Alistamiento</option>
                      <option value="Predictivo">Predictivo</option>
                      <option value="Preventivo no realizado">Preventivo no realizado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Falla / Problema Detectado</label>
                  <textarea 
                    value={correctiveData.descripcion || ''} 
                    onChange={e => setCorrectiveData({...correctiveData, descripcion: e.target.value.toUpperCase()})}
                    className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 text-white text-sm focus:border-rose-500 h-28 outline-none transition-all resize-none font-light leading-relaxed" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Revisión y Trabajos Realizados (Descripción Técnica)</label>
                  <textarea 
                    value={correctiveData.accion || ''} 
                    onChange={e => setCorrectiveData({...correctiveData, accion: e.target.value.toUpperCase()})}
                    className="w-full bg-violet-500/5 border border-violet-500/10 rounded-3xl px-6 py-4 text-violet-100 text-sm focus:border-violet-500 h-28 outline-none transition-all resize-none font-medium leading-relaxed italic" 
                  />
                </div>

                {/* --- SECCIÓN DE REPUESTOS --- */}
                <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 space-y-4">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Save size={12} /> Repuestos Utilizados
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-4">
                      <div className="col-span-4 text-[9px] font-bold text-white/20 uppercase tracking-widest px-2">Descripción del Repuesto / Periférico</div>
                      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-2 text-center">Cant.</div>
                    </div>
                    {(correctiveData.metadata?.repuestos || [{ desc: '', cant: '' }]).map((rep: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-5 gap-4">
                        <input 
                          placeholder="Nombre del repuesto..."
                          value={rep.desc || ''}
                          onChange={e => {
                            const newR = [...(correctiveData.metadata?.repuestos || [{ desc: '', cant: '' }])];
                            newR[idx] = { ...newR[idx], desc: e.target.value.toUpperCase() };
                            setCorrectiveData({ ...correctiveData, metadata: { ...correctiveData.metadata, repuestos: newR } });
                          }}
                          className="col-span-4 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-white text-xs focus:border-emerald-500 outline-none"
                        />
                        <input 
                          type="number"
                          placeholder="0"
                          value={rep.cant || ''}
                          onChange={e => {
                            const newR = [...(correctiveData.metadata?.repuestos || [{ desc: '', cant: '' }])];
                            newR[idx] = { ...newR[idx], cant: e.target.value };
                            setCorrectiveData({ ...correctiveData, metadata: { ...correctiveData.metadata, repuestos: newR } });
                          }}
                          className="bg-black/40 border border-white/5 rounded-xl px-2 py-2 text-white text-xs text-center focus:border-emerald-500 outline-none"
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newR = [...(correctiveData.metadata?.repuestos || [{ desc: '', cant: '' }]), { desc: '', cant: '' }];
                        setCorrectiveData({ ...correctiveData, metadata: { ...correctiveData.metadata, repuestos: newR } });
                      }}
                      className="text-[9px] font-bold text-emerald-400/50 hover:text-emerald-400 uppercase tracking-widest px-2 transition-colors"
                    >
                      + Agregar otro repuesto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Observaciones</label>
                    <textarea 
                      value={correctiveData.observaciones || ''} 
                      onChange={e => setCorrectiveData({...correctiveData, observaciones: e.target.value.toUpperCase()})}
                      className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 text-white text-sm focus:border-amber-500 h-28 outline-none transition-all resize-none font-light" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Concepto Técnico Final</label>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setCorrectiveData({...correctiveData, estado_equipo: 'APTO PARA USO'})}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${correctiveData.estado_equipo === 'APTO PARA USO' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-black/20 border-white/5 text-white/40 hover:bg-white/5'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${correctiveData.estado_equipo === 'APTO PARA USO' ? 'border-emerald-500' : 'border-white/10'}`}>
                          {correctiveData.estado_equipo === 'APTO PARA USO' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">Apto para Uso</span>
                      </button>

                      <button 
                        onClick={() => setCorrectiveData({...correctiveData, estado_equipo: 'NO APTO PARA USO'})}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${correctiveData.estado_equipo === 'NO APTO PARA USO' ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-black/20 border-white/5 text-white/40 hover:bg-white/5'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${correctiveData.estado_equipo === 'NO APTO PARA USO' ? 'border-rose-500' : 'border-white/10'}`}>
                          {correctiveData.estado_equipo === 'NO APTO PARA USO' && <div className="w-2 h-2 bg-rose-500 rounded-full" />}
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">No Apto para Uso</span>
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center gap-6">
              {item.type === 'PREVENTIVO' && !activeProtocol ? (
                <>
                  <AlertTriangle size={64} className="text-amber-500/50" />
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Protocolo no detectable</h4>
                    <p className="text-white/40 max-w-sm">No se pudo identificar un protocolo digital para el equipo "{equipment.equipo}". Solo podrá editar notas básicas.</p>
                  </div>
                </>
              ) : (
                <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
              )}
              
              {/* Fallback editor for simple logs */}
              {item.table === 'maintenance_logs' && (
                <div className="w-full text-left space-y-6 mt-10">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Fecha</label>
                      <input 
                         type="date" 
                         value={reportDate} 
                         onChange={e => setReportDate(e.target.value)} 
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-violet-500 outline-none transition-all invert" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Descripción de la Actividad</label>
                      <textarea 
                         value={notes} 
                         onChange={e => setNotes(e.target.value.toUpperCase())}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-violet-500 h-32 outline-none transition-all resize-none font-light leading-relaxed uppercase" 
                      />
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/10 bg-black/60 flex justify-end gap-4 shadow-inner">
          <button 
            onClick={onClose}
            className="px-8 py-4 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-3"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Sincronizar con el Servidor
          </button>
        </footer>
      </div>
    </div>
  );
};
