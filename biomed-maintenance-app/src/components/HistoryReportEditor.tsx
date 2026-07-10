import { useState, useEffect } from 'react';
import { X, Save, Download, Loader2, Activity, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateProtocolPDF } from '../utils/pdfGenerator';
import { generateCorrectivePDF } from '../utils/pdfCorrectiveGenerator';
import { useAuth } from '../contexts/AuthContext';
import { ProtocolForm } from './corrective/ProtocolForm';
import protocolsData from '../data/protocols.json';
import { ENGINEERS } from '../utils/engineerRegistry';

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
  const [selectedEngineer, setSelectedEngineer] = useState('');
  
  // Preventive states
  const [activeProtocol, setActiveProtocol] = useState<any | null>(null);
  const [checkValues, setCheckValues] = useState<Record<string, string>>({});
  const [numericValues, setNumericValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [reportDate, setReportDate] = useState('');

  // Corrective (correctivos_husj) states
  const [correctiveData, setCorrectiveData] = useState<any>(null);

  useEffect(() => {
    const loadCorrectiveData = async (protocolId: string) => {
      const { data, error } = await supabase
        .from('correctivos_husj')
        .select('*')
        .eq('no_reporte', protocolId)
        .single();
      
      if (!error && data) {
        setCorrectiveData(data);
      }
    };

    if (item.table === 'maintenance_logs') {
      const raw = item.raw;
      setNotes(raw.notes || '');
      setReportDate(raw.executed_at ? raw.executed_at.split('T')[0] : '');
      setCheckValues(raw.checks || {});
      setNumericValues(raw.numeric_values || {});

      if (item.type === 'CORRECTIVE' && raw.checks?.protocol_id) {
        loadCorrectiveData(raw.checks.protocol_id);
      }

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
      }
      
      alert('✅ Reporte actualizado.');
      onUpdate();
      onClose();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePDF = async () => {
    if (item.table === 'correctivos_husj') {
        try {
          setLoading(true);
          await generateCorrectivePDF(correctiveData, equipment, user?.email || '', selectedEngineer);
        } catch (err) {
          alert("Error al generar el PDF del correctivo.");
        } finally {
          setLoading(false);
        }
        return;
    }

    if (item.type !== 'PREVENTIVO' || !activeProtocol) return;
    
    try {
      setLoading(true);
      await generateProtocolPDF(
        activeProtocol, equipment, checkValues, numericValues, notes, 
        item.report_id, reportDate, user?.email || '', selectedEngineer
      );
    } catch (err) {
      alert("Error al generar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  const isCorrective = item.table === 'correctivos_husj' || correctiveData;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-full md:h-[92vh] bg-[#0a0f1a] md:border border-white/10 md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Cargando...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {isCorrective ? (
              <ProtocolForm 
                equipment={equipment}
                initialData={correctiveData}
                onSave={async (data) => {
                  const nextNo = data.no_reporte ? Number(data.no_reporte) : null;
                  if (!nextNo) {
                    alert("⚠️ El número de reporte es obligatorio.");
                    return;
                  }

                  setSaving(true);
                  try {
                    // FILTRO DE SEGURIDAD: Solo columnas reales de correctivos_husj
                    const allowedColumns = [
                      'no_reporte', 'periodo', 'fecha_creacion', 'fecha_atencion', 'fecha_cierre',
                      'equipo', 'marca', 'modelo', 'activo_fijo', 'equipment_id', 'servicio',
                      'ubicacion', 'descripcion', 'accion', 'tecnico', 'estado', 'estado_gma',
                      'estado_equipo', 'estado_norm', 'causa', 'serie', 'metadata'
                    ];

                    const filteredData: any = {};
                    allowedColumns.forEach(col => {
                      if (data[col] !== undefined) filteredData[col] = data[col];
                    });

                    filteredData.no_reporte = nextNo;
                    const oldReportNo = item.raw.no_reporte || item.raw.report_id;
                    
                    const { error: corrError } = await supabase
                      .from('correctivos_husj')
                      .update(filteredData)
                      .eq('no_reporte', oldReportNo);
                    
                    if (corrError) throw corrError;

                    // Sincronizar con maintenance_logs
                    await supabase
                      .from('maintenance_logs')
                      .update({ 
                        report_id: nextNo, 
                        notes: data.accion || data.descripcion,
                        // Prioridad: Fecha Cierre -> Fecha Inicio -> Fecha Original
                        executed_at: data.fecha_cierre || data.fecha_creacion || item.raw.executed_at
                      })
                      .or(`report_id.eq.${oldReportNo},checks->>report_no.eq.${oldReportNo}`);

                    alert("✅ Reporte Correctivo Sincronizado.");
                    onUpdate();
                    onClose();
                  } catch (err: any) {
                    alert("Error: " + err.message);
                  } finally {
                    setSaving(false);
                  }
                }}
                onCancel={onClose}
                saving={saving}
              />
            ) : (
              <>
                <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-emerald-400">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Historial Preventivo</h3>
                      <p className="text-emerald-400/50 text-[10px] font-black tracking-[0.4em] mt-1">
                        OS #{item.report_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      value={selectedEngineer}
                      onChange={e => setSelectedEngineer(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-[10px] uppercase font-black tracking-widest outline-none focus:border-emerald-500 transition-all appearance-none h-[42px]"
                    >
                      <option value="">Firma por defecto</option>
                      {ENGINEERS.map(eng => (
                        <option key={eng.pattern} value={eng.name}>{eng.name}</option>
                      ))}
                    </select>
                    <button onClick={handleRegeneratePDF} className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all h-[42px]">
                      <Download size={16} /> PDF
                    </button>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 text-white/20 hover:text-white rounded-2xl transition-all h-[42px] flex items-center justify-center">
                      <X size={24} />
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                  <div className="max-w-4xl mx-auto space-y-12">
                    <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5">
                      <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20">Fecha de Ejecución</span>
                      <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-all invert" />
                    </div>

                    {activeProtocol ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeProtocol.items?.map((pi: any) => (
                            <div key={pi.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-all">
                              <span className="text-[11px] text-white/50 font-bold uppercase tracking-tight">{pi.label}</span>
                              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
                                {['cumple', 'nc', 'na'].map((opt) => (
                                  <button key={opt} onClick={() => setCheckValues(prev => ({ ...prev, [pi.id]: opt }))} className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${checkValues[pi.id] === opt ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/10 hover:text-white/30'}`}>
                                    {opt === 'cumple' ? 'SI' : opt === 'nc' ? 'NO' : 'NA'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {activeProtocol.numeric_items?.map((num: any) => (
                            <div key={num.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
                              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{num.label} ({num.unit})</span>
                              <input type="text" value={numericValues[num.id] || ''} onChange={e => setNumericValues(prev => ({ ...prev, [num.id]: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-base font-mono focus:border-emerald-500 outline-none" placeholder="---" />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-20 text-center space-y-4 opacity-20">
                        <AlertTriangle size={64} className="mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest">Sin Protocolo Digital</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-4">Observaciones</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value.toUpperCase())} className="w-full bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 text-white text-base focus:border-emerald-500 h-64 resize-none outline-none shadow-inner" />
                    </div>
                  </div>
                </div>

                <footer className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-2xl flex justify-end gap-6">
                  <button onClick={onClose} className="px-10 py-5 text-white/20 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cerrar</button>
                  <button onClick={handleSave} disabled={saving} className="px-14 py-5 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-4 border border-white/10">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
                  </button>
                </footer>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
