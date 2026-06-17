import { useState, useEffect } from 'react';
import { 
  Loader2, Calendar, Search,
  Clock, MapPin, ClipboardList, Package, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Wrench, FileText,
  Check, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ENGINEERS } from '../../utils/engineerRegistry';

interface ProtocolFormProps {
  equipment: any | null;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export const ProtocolForm = ({ equipment, initialData, onSave, onCancel, saving = false }: ProtocolFormProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(equipment);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [correctiveData, setCorrectiveData] = useState<any>(initialData || {
    equipo: equipment?.equipo || '',
    marca: equipment?.marca || '',
    modelo: equipment?.modelo || '',
    serie: equipment?.numero_serie || equipment?.serial || '',
    activo_fijo: equipment?.id_unico || '',
    servicio: equipment?.servicio || '',
    ubicacion: equipment?.ubicacion || '',
    equipment_id: equipment?.id || null,
    descripcion: '',
    accion: '',
    tecnico: user?.email?.split('@')[0]?.toUpperCase() || '',
    estado_equipo: 'OPERATIVO',
    estado_norm: 'CERRADO',
    no_reporte: initialData?.no_reporte || '',
    fecha_cierre: initialData?.fecha_cierre || new Date().toISOString().split('T')[0],
    prioridad: 'MEDIA',
    metadata: {
      tiempos: { inicio: '', fin: '' },
      piso: '',
      contrato: 'Mantenimiento',
      procedimiento: 'Correctivo',
      checklist: {
        limpieza: true,
        bateria: false,
        optico: false,
        impresora: false,
        operacion: true,
        neumatico: false,
        hidraulico: false,
        alarmas: false,
        autotest: true,
        electronico: false,
        mecanico: false,
        accesorios: false,
        pantalla: false,
        electrico: false,
        respaldo: false,
        software: false,
      },
      repuestos: [{ desc: '', cant: '' }]
    }
  });

  // Búsqueda dinámica de equipos
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const { data, error } = await supabase
          .from('equipments')
          .select('*')
          .or(`id_unico.ilike.%${searchQuery}%,equipo.ilike.%${searchQuery}%`)
          .limit(5);

        if (!error) setSearchResults(data || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const selectAsset = (asset: any) => {
    setSelectedAsset(asset);
    setCorrectiveData((prev: any) => ({
      ...prev,
      equipo: asset.equipo,
      marca: asset.marca,
      modelo: asset.modelo,
      serie: asset.numero_serie || asset.serial || '',
      activo_fijo: asset.id_unico,
      servicio: asset.servicio,
      ubicacion: asset.ubicacion,
      equipment_id: asset.id,
      metadata: {
        ...prev.metadata,
        piso: asset.ubicacion || ''
      }
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    if (initialData) {
      setCorrectiveData({
        ...initialData,
        metadata: initialData.metadata || {
          tiempos: { inicio: '', fin: '' },
          piso: '',
          contrato: 'Mantenimiento',
          procedimiento: 'Correctivo',
          checklist: {},
          repuestos: [{ desc: '', cant: '' }]
        }
      });
    }
  }, [initialData]);

  const handleMetadataChange = (section: string, field: string, value: any) => {
    setCorrectiveData((prev: any) => {
      const metadata = prev.metadata || {};
      const sectionData = metadata[section] || {};
      return {
        ...prev,
        metadata: {
          ...metadata,
          [section]: {
            ...sectionData,
            [field]: value
          }
        }
      };
    });
  };

  const handleBaseMetadataChange = (field: string, value: any) => {
    setCorrectiveData((prev: any) => {
      const metadata = prev.metadata || {};
      return {
        ...prev,
        metadata: {
          ...metadata,
          [field]: value
        }
      };
    });
  };

  const addSpare = () => {
    const currentSpares = correctiveData.metadata.repuestos || [];
    handleBaseMetadataChange('repuestos', [...currentSpares, { desc: '', cant: '' }]);
  };

  const updateSpare = (index: number, field: string, value: any) => {
    const currentSpares = [...(correctiveData.metadata.repuestos || [])];
    currentSpares[index] = { ...currentSpares[index], [field]: value.toUpperCase() };
    handleBaseMetadataChange('repuestos', currentSpares);
  };

  const steps = [
    { id: 1, name: 'IDENTIFICACIÓN' },
    { id: 2, name: 'DIAGNÓSTICO' },
    { id: 3, name: 'CHECKLIST' },
    { id: 4, name: 'FINALIZACIÓN' }
  ];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between px-2 md:px-4">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div 
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                step >= s.id ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20' : 'bg-white/5 text-white/20 border border-white/5'
              }`}
            >
              {step > s.id ? <Check size={16} strokeWidth={4} /> : s.id}
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-[2px] flex-1 mx-4 rounded-full transition-all duration-500 ${step > s.id ? 'bg-emerald-500' : 'bg-white/5'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between px-2 md:px-4">
        {steps.map(s => (
          <span 
            key={s.id}
            className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${step === s.id ? 'text-white' : 'text-white/10'}`}
          >
            {s.name}
          </span>
        ))}
      </div>

      {/* Form Content */}
      <div className="min-h-[300px] md:min-h-[380px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 md:space-y-6"
            >
              {!selectedAsset ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Búsqueda de Activo Principal</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Escriba Placa o Nombre del Equipo..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-white focus:border-fuchsia-500 transition-all font-medium placeholder:text-white/10"
                    />
                    {(isSearching || searchResults.length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl">
                        {isSearching ? (
                          <div className="p-6 text-center text-white/40 flex items-center justify-center gap-3">
                            <Loader2 className="animate-spin" size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Buscando en servidor...</span>
                          </div>
                        ) : (
                          searchResults.map(asset => (
                            <div 
                              key={asset.id} 
                              onClick={() => selectAsset(asset)} 
                              className="px-6 py-4 hover:bg-fuchsia-500/10 cursor-pointer border-b border-white/5 flex justify-between items-center group transition-colors"
                            >
                               <div>
                                  <p className="text-white font-bold group-hover:text-fuchsia-400 transition-colors">{asset.equipo}</p>
                                  <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-0.5">{asset.marca} • {asset.servicio}</p>
                               </div>
                               <span className="bg-fuchsia-500/10 text-fuchsia-400 px-3 py-1 rounded-lg font-mono font-bold text-xs">#{asset.id_unico}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-fuchsia-500/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-fuchsia-500/10 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-fuchsia-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/20">
                        <MapPin size={20} className="md:w-6 md:h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-base md:text-xl tracking-tight leading-tight">{selectedAsset.equipo}</h3>
                        <p className="text-white/30 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Activo Fijo: #{selectedAsset.id_unico}</p>
                      </div>
                    </div>
                    {/* Botón para cambiar equipo si se equivocó */}
                    {!initialData && (
                      <button 
                        onClick={() => setSelectedAsset(null)}
                        className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest hover:text-white transition-colors border border-fuchsia-500/20 px-3 py-1.5 rounded-lg bg-fuchsia-500/5"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                    {[
                      { label: 'SERVICIO', value: selectedAsset.servicio },
                      { label: 'MARCA', value: selectedAsset.marca },
                      { label: 'MODELO', value: selectedAsset.modelo },
                      { label: 'SERIE', value: selectedAsset.numero_serie || selectedAsset.serial }
                    ].map((info, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-widest">{info.label}</p>
                        <p className="text-white font-bold text-[10px] md:text-xs truncate">{info.value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-500/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-blue-500/10 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1 md:mb-2">Número de Reporte / ID Servicio</p>
                  <input 
                    type="number"
                    placeholder="Ej: 27855"
                    value={correctiveData.no_reporte || ''}
                    onChange={e => setCorrectiveData({...correctiveData, no_reporte: e.target.value})}
                    className="bg-transparent border-none text-lg md:text-xl font-black text-white outline-none w-full placeholder:text-white/5"
                  />
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <FileText size={18} className="md:w-5 md:h-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                    <Calendar size={12} className="text-fuchsia-400" /> Fecha Inicio
                  </label>
                  <input 
                    type="date" 
                    value={correctiveData.fecha_creacion || ''} 
                    onChange={e => setCorrectiveData({...correctiveData, fecha_creacion: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-xs focus:border-fuchsia-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                    <Clock size={12} className="text-fuchsia-400" /> Hora Inicio
                  </label>
                  <input 
                    type="time" 
                    value={correctiveData.metadata.tiempos.inicio || ''} 
                    onChange={e => handleMetadataChange('tiempos', 'inicio', e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-xs focus:border-fuchsia-400 outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                    <MapPin size={12} className="text-fuchsia-400" /> Piso / Ubicación
                  </label>
                  <input 
                    placeholder="Especifique..."
                    value={correctiveData.metadata.piso || ''} 
                    onChange={e => handleBaseMetadataChange('piso', e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-xs focus:border-fuchsia-400 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 md:space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Tipo de Contrato</label>
                  <select 
                    value={correctiveData.metadata.contrato || 'Mantenimiento'} 
                    onChange={e => handleBaseMetadataChange('contrato', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-xs focus:border-fuchsia-500 outline-none appearance-none transition-all"
                  >
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Arriendo">Arriendo</option>
                    <option value="Comodato">Comodato</option>
                    <option value="Garantía">Garantía</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Procedimiento Ejecutado</label>
                  <select 
                    value={correctiveData.metadata.procedimiento || 'Correctivo'} 
                    onChange={e => handleBaseMetadataChange('procedimiento', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-xs focus:border-fuchsia-500 outline-none appearance-none transition-all"
                  >
                    <option value="Correctivo">Correctivo</option>
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="Instalación">Instalación</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Preventivo">Preventivo</option>
                    <option value="Alistamiento">Alistamiento</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <AlertCircle size={12} /> Falla Reportada / Problema Detectado
                </label>
                <textarea 
                  value={correctiveData.descripcion || ''} 
                  onChange={e => setCorrectiveData({...correctiveData, descripcion: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-xs md:text-sm focus:border-rose-500 h-24 md:h-28 outline-none transition-all resize-none shadow-inner" 
                  placeholder="Describa el problema..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <Wrench size={12} /> Revisión Técnica y Trabajos Realizados
                </label>
                <textarea 
                  value={correctiveData.accion || ''} 
                  onChange={e => setCorrectiveData({...correctiveData, accion: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-xs md:text-sm focus:border-emerald-500 h-24 md:h-28 outline-none transition-all resize-none shadow-inner" 
                  placeholder="Detalle el trabajo realizado..."
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="bg-violet-500/5 p-4 md:p-6 rounded-[1.5rem] border border-violet-500/10 backdrop-blur-xl">
                <h4 className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                  <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
                    <ClipboardList size={14} />
                  </div>
                  Matriz de Revisión Técnica
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
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
                    { id: 'electrico', label: 'Sist. Eléctrico' },
                    { id: 'respaldo', label: 'Sist. Respaldo' },
                    { id: 'software', label: 'Software' },
                  ].map(task => (
                    <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox"
                          checked={correctiveData.metadata.checklist[task.id] || false}
                          onChange={e => {
                            const newChecklist = { ...correctiveData.metadata.checklist, [task.id]: e.target.checked };
                            handleBaseMetadataChange('checklist', newChecklist);
                          }}
                          className="peer appearance-none w-5 h-5 rounded-lg border-2 border-white/10 bg-black/40 checked:bg-fuchsia-500 checked:border-fuchsia-500 transition-all"
                        />
                        <Check size={12} strokeWidth={4} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-[8px] md:text-[9px] font-black text-white/30 group-hover:text-white uppercase tracking-widest transition-colors">{task.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-500/5 p-4 md:p-6 rounded-[1.5rem] border border-emerald-500/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-3 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Package size={14} />
                    </div>
                    Repuestos Utilizados
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); addSpare(); }}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[8px] font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                  >
                    + AGREGAR
                  </button>
                </div>
                <div className="space-y-3 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                  {correctiveData.metadata.repuestos.map((rep: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input 
                        placeholder="Descripción..."
                        value={rep.desc || ''}
                        onChange={e => updateSpare(idx, 'desc', e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-[10px] focus:border-emerald-500 outline-none shadow-inner"
                      />
                      <input 
                        type="number"
                        placeholder="Cant."
                        value={rep.cant || ''}
                        onChange={e => updateSpare(idx, 'cant', e.target.value)}
                        className="w-16 bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-white text-[10px] text-center focus:border-emerald-500 outline-none shadow-inner"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 ml-2">
                    <Clock size={12} className="text-emerald-400" /> Cierre de Protocolo
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">Fecha Fin</p>
                      <input 
                        type="date" 
                        value={correctiveData.fecha_cierre || ''} 
                        onChange={e => setCorrectiveData({...correctiveData, fecha_cierre: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[10px] focus:border-emerald-500 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">Hora Fin</p>
                      <input 
                        type="time" 
                        value={correctiveData.metadata.tiempos.fin || ''} 
                        onChange={e => handleMetadataChange('tiempos', 'fin', e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[10px] focus:border-emerald-500 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 ml-2">
                    <CheckCircle2 size={12} className="text-emerald-400" /> Concepto Técnico
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setCorrectiveData({...correctiveData, estado_equipo: 'OPERATIVO'})}
                      className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${correctiveData.estado_equipo === 'OPERATIVO' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 text-white/20 border border-white/10 hover:bg-white/10'}`}
                    >
                      Apto
                    </button>
                    <button 
                      onClick={() => setCorrectiveData({...correctiveData, estado_equipo: 'FUERA DE SERVICIO'})}
                      className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${correctiveData.estado_equipo === 'FUERA DE SERVICIO' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/5 text-white/20 border border-white/10 hover:bg-white/10'}`}
                    >
                      No Apto
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <User size={12} className="text-fuchsia-400" /> Ingeniero Responsable
                </label>
                <select 
                  value={correctiveData.tecnico || ''} 
                  onChange={e => setCorrectiveData({...correctiveData, tecnico: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-xs md:text-sm focus:border-fuchsia-500 outline-none appearance-none transition-all shadow-inner"
                >
                  <option value="" disabled>Seleccione Ingeniero...</option>
                  {ENGINEERS.map(eng => (
                    <option key={eng.id} value={eng.name}>{eng.name}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 px-2">
        <button 
          type="button"
          onClick={() => step === 1 ? onCancel() : setStep(s => s - 1)}
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
        >
          <ChevronLeft size={14} /> {step === 1 ? 'CANCELAR' : 'ATRÁS'}
        </button>
        <button 
          type="button"
          onClick={() => step === 4 ? onSave(correctiveData) : setStep(s => s + 1)}
          disabled={saving}
          className="flex items-center gap-2 bg-fuchsia-500 text-white px-6 py-3 rounded-xl font-black text-[10px] shadow-lg shadow-fuchsia-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> GUARDANDO...
            </>
          ) : (
            <>
              <span className="truncate">{step === 4 ? 'GUARDAR Y CERRAR' : 'SIGUIENTE PASO'}</span>
              <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
