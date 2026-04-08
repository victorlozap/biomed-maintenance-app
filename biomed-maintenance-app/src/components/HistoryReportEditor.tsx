import { useState, useEffect } from 'react';
import { X, Save, Download, Loader2, CheckCircle, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateProtocolPDF } from '../utils/pdfGenerator';
import protocolsData from '../data/protocols.json';

const protocols = protocolsData as Record<string, any>;

interface HistoryReportEditorProps {
  item: any;
  equipment: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const HistoryReportEditor = ({ item, equipment, onClose, onUpdate }: HistoryReportEditorProps) => {
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
          .eq('id', item.id);

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
        reportDate
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
            {item.type === 'PREVENTIVO' && (
              <button 
                onClick={handleRegeneratePDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold uppercase transition-all hover:scale-105"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} 
                Regenerar PDF
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Fecha del Reporte</label>
                    <input 
                       type="date" 
                       value={correctiveData.fecha_creacion?.split('T')[0] || ''} 
                       onChange={e => setCorrectiveData({...correctiveData, fecha_creacion: e.target.value})} 
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 outline-none transition-all invert" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Técnico</label>
                    <input 
                       value={correctiveData.tecnico || ''} 
                       onChange={e => setCorrectiveData({...correctiveData, tecnico: e.target.value.toUpperCase()})} 
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Estado Diagnosticado</label>
                    <select 
                      value={correctiveData.estado_equipo || 'OPERATIVO'} 
                      onChange={e => setCorrectiveData({...correctiveData, estado_equipo: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 outline-none"
                    >
                      <option value="OPERATIVO">OPERATIVO</option>
                      <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                      <option value="BAJA">BAJA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Estado Orden</label>
                    <select 
                      value={correctiveData.estado_norm || 'CERRADO'} 
                      onChange={e => setCorrectiveData({...correctiveData, estado_norm: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 outline-none"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="TRABAJANDO">TRABAJANDO</option>
                      <option value="CERRADO">CERRADO</option>
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
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Acción de Mitigación / Reparación</label>
                  <textarea 
                    value={correctiveData.accion || ''} 
                    onChange={e => setCorrectiveData({...correctiveData, accion: e.target.value.toUpperCase()})}
                    className="w-full bg-violet-500/5 border border-violet-500/10 rounded-3xl px-6 py-4 text-violet-100 text-sm focus:border-violet-500 h-28 outline-none transition-all resize-none font-medium leading-relaxed italic" 
                  />
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
