import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, X, Loader2, RefreshCw, Activity, Edit, Download, Save, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [localInventory, setLocalInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLogModalOpen, setIsEditLogModalOpen] = useState(false);
  const [equipmentHistory, setEquipmentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editLogData, setEditLogData] = useState<any>(null);
  const [editEqData, setEditEqData] = useState<any>({});
  const [newEqData, setNewEqData] = useState({ 
    equipo: '', marca: '', modelo: '', numero_serie: '', id_unico: '', ubicacion: '', servicio: '', estado: 'BUENO', riesgo: 'I' 
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEquipment) return;
    
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedEquipment.id_unico}_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // 1. Subir al Storage de Supabase (Bucket: 'equipment-images')
      const { error: uploadError } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(filePath);

      // 3. Actualizar la base de datos con la nueva URL
      const { error: dbError } = await supabase
        .from('equipments')
        .update({ foto_url: publicUrl })
        .eq('id', selectedEquipment.id);

      if (dbError) throw dbError;

      // 4. Actualizar estado local
      const updatedEq = { ...selectedEquipment, foto_url: publicUrl };
      setSelectedEquipment(updatedEq);
      setLocalInventory(prev => prev.map(item => item.id === updatedEq.id ? updatedEq : item));
      
      alert('¡Foto cargada y guardada correctamente en Supabase!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen: ' + (error.message || 'Verifica que el bucket "equipment-images" esté creado en Supabase.'));
    } finally {
      setLoading(false);
    }
  };

  // Helper para formatear fechas (incluyendo fechas de Excel)
  const formatDate = (val: any) => {
    if (!val || val === 'N/A' || val === 'No Aplica') return 'No Aplica';
    
    try {
      // Manejar fechas de Excel (números)
      if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/'))) {
        const excelDate = parseFloat(val as string);
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }

      // Manejar strings (ISO o similares de Supabase)
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    return val;
  };
  
  // Cargar datos desde Supabase
  const fetchEquipments = async () => {
    setLoading(true);
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('id_unico', { ascending: true });

      if (error) {
        console.error('Error fetching equipments:', error);
        hasMore = false;
      } else if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    setLocalInventory(allData);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  // Cargar historial al seleccionar equipo
  useEffect(() => {
    if (selectedEquipment) {
      fetchEquipmentHistory(selectedEquipment.id, selectedEquipment.id_unico);
    } else {
      setEquipmentHistory([]);
    }
  }, [selectedEquipment]);

  const fetchEquipmentHistory = async (eqId: string, idUnico: string) => {
    setLoadingHistory(true);
    try {
      // 1. Logs de mantenimiento (maintenance_logs)
      const { data: logs, error: logsError } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('equipment_id', eqId)
        .order('executed_at', { ascending: false });

      // 2. Correctivos formales (correctivos_husj)
      const { data: correctivos, error: corrError } = await supabase
        .from('correctivos_husj')
        .select('*')
        .eq('activo_fijo', idUnico)
        .order('fecha_creacion', { ascending: false });

      if (logsError || corrError) throw logsError || corrError;

      const combined = [
        ...(logs || []).map(l => ({ 
          id: l.id, 
          table: 'maintenance_logs', 
          date: l.executed_at, 
          type: l.checks?.type === 'CORRECTIVE' ? 'CORRECTIVO' : 'PREVENTIVO', 
          report_id: l.report_id, 
          technician: 'BIO-CLOUD',
          action: l.notes || 'Revisión periódica',
          raw: l
        })),
        ...(correctivos || []).map(c => ({ 
          id: c.id, 
          table: 'correctivos_husj', 
          date: c.fecha_creacion, 
          type: 'CORRECTIVO', 
          report_id: c.no_reporte, 
          technician: c.tecnico, 
          action: c.accion || c.descripcion,
          raw: c
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEquipmentHistory(combined);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteActivity = async (item: any) => {
    if (!confirm(`¿Estás seguro de eliminar el reporte #${item.report_id}? Esta acción es irreversible.`)) return;
    
    setLoadingHistory(true);
    try {
      const { error } = await supabase
        .from(item.table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      setEquipmentHistory(prev => prev.filter(a => a.id !== item.id));
      alert('Registro eliminado correctamente.');
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateLog = async () => {
    if (!editLogData) return;
    setLoadingHistory(true);
    try {
      const { id, table, action, date } = editLogData;
      
      const updatePayload: any = {};
      if (table === 'maintenance_logs') {
        updatePayload.notes = action;
        updatePayload.executed_at = date;
      } else {
        updatePayload.accion = action;
        updatePayload.fecha_creacion = date;
      }

      const { error } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
      
      setEquipmentHistory(prev => prev.map(a => a.id === id ? { ...a, action, date } : a));
      setIsEditLogModalOpen(false);
      alert('Registro actualizado.');
    } catch (err: any) {
      alert('Error al actualizar: ' + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddNewEq = async () => {
    if(!newEqData.equipo || !newEqData.id_unico) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('equipments')
      .insert([newEqData])
      .select();

    if (error) {
      alert('Error al guardar el equipo: ' + error.message);
    } else {
      setLocalInventory(prev => [data[0], ...prev]);
      setIsAddModalOpen(false);
      setNewEqData({ equipo: '', marca: '', modelo: '', numero_serie: '', id_unico: '', ubicacion: '', servicio: '', estado: 'BUENO', riesgo: 'I' });
    }
    setLoading(false);
  };

  const handleSaveEditEq = async () => {
    if(!editEqData.id_unico) return;
    setLoading(true);
    
    const { id, created_at, ...updateData } = editEqData; // No actualizar IDs ni fecha creación

    const { error } = await supabase
      .from('equipments')
      .update(updateData)
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      await fetchEquipments(); // Recargar para ver cambios
      setSelectedEquipment(editEqData);
      setIsEditModalOpen(false);
    }
    setLoading(false);
  };
  
  const filteredData = useMemo(() => {
    if (!searchTerm) return localInventory.slice(0, 5000);
    
    const lowerTheme = searchTerm.toLowerCase();
    return localInventory.filter(item => 
      String(item.equipo || '').toLowerCase().includes(lowerTheme) ||
      String(item.id_unico || '').toLowerCase().includes(lowerTheme) ||
      String(item.marca || '').toLowerCase().includes(lowerTheme) ||
      String(item.modelo || '').toLowerCase().includes(lowerTheme) ||
      String(item.ubicacion || '').toLowerCase().includes(lowerTheme) ||
      String(item.servicio || '').toLowerCase().includes(lowerTheme)
    ).slice(0, 5000);
  }, [searchTerm, localInventory]);

  const getStatusStyle = (estado: string) => {
    const status = String(estado || '').toLowerCase();
    if (status.includes('bueno') || status.includes('funcional') || status.includes('operativo')) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
    }
    if (status.includes('mantenimiento') || status.includes('reparacion')) {
      return "bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]";
    }
    if (status.includes('malo') || status.includes('baja') || status.includes('falla')) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
    }
    return "bg-slate-500/20 text-slate-300 border-slate-500/30 shadow-[0_0_10px_rgba(148,163,184,0.2)]";
  };

  const getRiskStyle = (risk: string) => {
    const r = String(risk || '').toLowerCase();
    if (r.includes('alto') || r.includes('iii')) return "text-rose-400 font-medium drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]";
    if (r.includes('medio') || r.includes('ii')) return "text-amber-400 font-medium drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]";
    if (r.includes('bajo') || r.includes('i')) return "text-emerald-400 font-medium drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]";
    return "text-white/60";
  };

  const handleDownloadPDF = async () => {
    try {
      const { generateProfilePDF } = await import('../utils/pdfProfileGenerator');
      // Mapear campos de vuelta a lo que espera el generador de PDF (Legacy keys) si es necesario
      await generateProfilePDF(selectedEquipment);
    } catch (error) {
       console.error("Error generando el PDF:", error);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10 custom-scrollbar">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-wide">
            Inventario Centralizado ({localInventory.length})
          </h2>
          <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide">
            Base de datos en tiempo real de Supabase HUSJ.
          </p>
        </div>
        <div className="flex flex-row gap-4 w-full md:w-auto">
          <button onClick={fetchEquipments} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all flex-none">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-orange-300/50 flex items-center justify-center gap-2 text-sm md:text-base">
            <Plus size={18} /> <span className="hidden sm:inline">Agregar</span> Equipo
          </button>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-4 md:p-5 lg:p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-8 flex flex-col md:flex-row gap-4 md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por placa, nombre o marca..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white font-light placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all shadow-inner text-sm md:text-base"
          />
        </div>
        <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-light tracking-wide hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2">
          <Filter size={18} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" /> Filtros
        </button>
      </div>

      {/* Tabla/Cards Principal */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-1 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        {loading && localInventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 md:p-32 gap-4">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            <p className="text-white/40 font-light tracking-widest text-sm uppercase">Cargando Nube HUSJ...</p>
          </div>
        ) : (
          <div className="w-full bg-black/10 rounded-[22px] overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              
              {/* Desktop Table */}
              <table className="w-full text-left border-collapse hidden md:table">
                <thead className="sticky top-0 z-20 backdrop-blur-3xl bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="py-4 px-6 text-white/50 font-light tracking-widest uppercase text-[11px]">Placa / Cód</th>
                    <th className="py-4 px-6 text-white/50 font-light tracking-widest uppercase text-[11px]">Equipo</th>
                    <th className="py-4 px-6 text-white/50 font-light tracking-widest uppercase text-[11px]">Ubicación</th>
                    <th className="py-4 px-6 text-white/50 font-light tracking-widest uppercase text-[11px]">Estado</th>
                    <th className="py-4 px-6 text-white/50 font-light tracking-widest uppercase text-[11px]">Riesgo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredData.map((item, idx) => (
                    <tr key={item.id || idx} onClick={() => setSelectedEquipment(item)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="py-4 px-6">
                        <span className="text-white/80 font-medium tracking-wide">{item.id_unico || '-'}</span>
                        <span className="block text-white/30 text-[10px] uppercase font-light mt-1">S/N: {item.numero_serie || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white/90 font-medium">{item.equipo || 'Desconocido'}</p>
                        <p className="text-white/40 text-[11px] mt-1 font-light uppercase tracking-wide">
                          {item.marca || 'S/M'} {item.modelo ? `/ ${item.modelo}` : ''}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white/70 font-light text-sm">{item.ubicacion || item.servicio || 'No Asignada'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full border text-[10px] tracking-wider uppercase font-medium ${getStatusStyle(item.estado)}`}>
                          {item.estado || 'S/E'}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-sm uppercase tracking-wide ${getRiskStyle(item.riesgo)}`}>
                        {item.riesgo || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredData.map((item, idx) => (
                  <div key={item.id || idx} onClick={() => setSelectedEquipment(item)} className="p-4 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-orange-400 font-mono text-sm">#{item.id_unico || '-'}</span>
                        <h4 className="text-white font-medium text-lg mt-1">{item.equipo || 'Desconocido'}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full border text-[9px] tracking-wider uppercase font-bold ${getStatusStyle(item.estado)}`}>
                        {item.estado || 'S/E'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-white/40 text-xs uppercase tracking-wide">
                        <p>{item.marca || 'S/M'} {item.modelo ? `/ ${item.modelo}` : ''}</p>
                        <p className="mt-1 text-[10px]">{item.servicio || 'No Asignada'}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${getRiskStyle(item.riesgo)}`}>
                        Riesgo {item.riesgo || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredData.length === 0 && !loading && (
                <div className="p-16 text-center text-white/30 font-light tracking-wide italic">
                  No hay resultados para esta búsqueda.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalle (Hoja de Vida) */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedEquipment(null)}></div>
          <div className="relative bg-[#0a0f1a] w-full h-full md:h-[85vh] md:max-w-6xl md:rounded-[2rem] border-t md:border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="relative z-10 p-4 md:p-6 md:px-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden w-full">
                <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex-none">
                  <Activity className="text-orange-400 w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className="text-sm md:text-2xl lg:text-3xl font-bold tracking-tight text-white/90 truncate pr-4 leading-tight">{selectedEquipment.equipo}</h3>
                  <p className="text-white/40 text-[9px] md:text-sm mt-0.5 md:mt-1 font-light tracking-wide flex items-center gap-2 truncate">
                    <span className="text-orange-500/80 font-bold">ACTIVO:</span> {selectedEquipment.id_unico}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button onClick={() => { setEditEqData(selectedEquipment); setIsEditModalOpen(true); }} className="flex-1 sm:flex-none p-2 md:px-6 md:py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Edit size={16} /> <span className="hidden sm:inline">Editar</span>
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 sm:flex-none p-2 md:px-6 md:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Download size={18} /> <span className="hidden sm:inline">PDF</span>
                </button>
                <button onClick={() => setSelectedEquipment(null)} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors border border-white/5 flex-none">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {/* Visual Identity / Image Placeholder */}
                <div className="space-y-4 md:space-y-6">
                   <div 
                    className="bg-white/5 border border-white/5 rounded-3xl h-full min-h-[350px] flex flex-col items-center relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300 shadow-xl"
                   >
                      <input 
                        id="file-input-id"
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none"></div>
                      
                      {selectedEquipment.foto_url ? (
                        <div className="w-full h-[300px] p-4 flex items-center justify-center">
                          <img 
                            src={selectedEquipment.foto_url} 
                            alt={selectedEquipment.equipo} 
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]" 
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mb-4 text-white/20 group-hover:scale-110 group-hover:text-orange-400 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                            <Activity size={40} />
                          </div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-center group-hover:text-white transition-colors">Sin Imagen BioMed</p>
                        </div>
                      )}

                      {/* Footer de la tarjeta con el botón */}
                      <div className="mt-auto w-full p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex flex-col items-center gap-2">
                        {selectedEquipment.foto_url && (
                           <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-center">Imagen de Equipo</p>
                        )}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('file-input-id')?.click();
                          }}
                          className="w-full max-w-[150px] py-2 bg-white/10 hover:bg-orange-500 border border-white/10 rounded-xl text-[9px] text-white uppercase font-bold tracking-wider transition-all"
                        >
                          {selectedEquipment.foto_url ? 'Cambiar Foto' : 'Cargar Foto'}
                        </button>
                      </div>
                   </div>
                </div>

                {/* Info Básica */}
                <div className="space-y-4 md:space-y-6">
                   <div className="bg-white/5 border border-white/5 rounded-3xl p-4 md:p-5 lg:p-6 h-full flex flex-col">
                      <h4 className="text-xs uppercase tracking-widest text-white/40 mb-5 pb-3 border-b border-white/10 font-bold">Identificación Técnica</h4>
                      <div className="space-y-4 flex-1">
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Marca</p>
                          <p className="text-white font-medium text-lg leading-tight">{selectedEquipment.marca || 'N/A'}</p>
                        </div>
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Modelo</p>
                          <p className="text-white font-medium text-lg leading-tight">{selectedEquipment.modelo || 'N/A'}</p>
                        </div>
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Serial</p>
                          <p className="text-orange-300 font-mono text-lg leading-tight">{selectedEquipment.numero_serie || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Localización y Riesgo */}
                <div className="space-y-4 md:space-y-6">
                   <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-4 md:p-5 lg:p-6 h-full flex flex-col">
                      <h4 className="text-indigo-400 text-xs tracking-widest uppercase mb-5 pb-3 border-b border-white/5 font-bold">Ubicación y Riesgo</h4>
                      <div className="space-y-4 flex-1">
                         <div className="bg-black/30 p-3.5 rounded-2xl border border-indigo-500/10 flex flex-col items-start gap-1">
                           <p className="text-indigo-300/50 text-[10px] uppercase font-bold tracking-wider">SERVICIO</p>
                           <p className="text-white text-base font-medium leading-relaxed">{selectedEquipment.servicio || 'N/A'}</p>
                         </div>
                         <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 flex flex-col items-start gap-1">
                           <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">UBICACIÓN</p>
                           <p className="text-white text-base font-medium leading-relaxed">{selectedEquipment.ubicacion || 'N/A'}</p>
                         </div>
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Clase de Riesgo</p>
                          <p className={`${getRiskStyle(selectedEquipment.riesgo)} text-lg uppercase font-bold`}>{selectedEquipment.riesgo || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Calibración y Gestión */}
                <div className="space-y-4 md:space-y-6">
                   <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-4 md:p-5 lg:p-6 h-full flex flex-col">
                      <h4 className="text-emerald-400 text-xs tracking-widest uppercase mb-5 pb-3 border-b border-white/5 font-bold">Gestión HUSJ</h4>
                      <div className="space-y-4 flex-1">
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 flex flex-col items-start gap-1">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Frecuencia Mtto.</p>
                          <p className="text-white text-base font-medium leading-tight">{selectedEquipment.frecuencia_mantenimiento || 'Semestral'}</p>
                        </div>
                        <div className="bg-emerald-400/5 p-3.5 rounded-2xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]">
                          <p className="text-emerald-300/40 text-[10px] uppercase font-bold tracking-wider mb-1">Última Calibración</p>
                          <p className="text-emerald-400 font-mono text-base font-bold leading-tight">{formatDate(selectedEquipment.fecha_calibracion)}</p>
                        </div>
                        <div className="bg-rose-400/5 p-3.5 rounded-2xl border border-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
                          <p className="text-rose-300/40 text-[10px] uppercase font-bold tracking-wider mb-1">Vcto. Calibración</p>
                          <p className="text-rose-400 font-mono text-lg font-bold leading-tight">{formatDate(selectedEquipment.fecha_vencimiento_calibracion)}</p>
                        </div>
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Garantía</p>
                          <p className="text-white text-base font-light leading-tight">{selectedEquipment.garantia || 'Expirada'}</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* HISTORIAL DE MANTENIMIENTO - FULL WIDTH SECTION */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 md:p-8 lg:p-10 backdrop-blur-xl">
                    <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-3">
                          <Calendar className="text-violet-400" size={24} /> Historial de Actividades Técnicas
                        </h4>
                        <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mt-1">Bitácora de vida del activo en tiempo real</p>
                      </div>
                      <span className="px-5 py-2 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-[10px] font-black uppercase tracking-widest">
                        {equipmentHistory.length} Registros
                      </span>
                    </header>

                    {loadingHistory ? (
                      <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                      </div>
                    ) : equipmentHistory.length > 0 ? (
                      <div className="space-y-4">
                        {equipmentHistory.map((item, idx) => (
                          <div key={idx} className="group relative bg-black/20 border border-white/5 hover:border-white/20 rounded-3xl p-5 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                  item.type === 'CORRECTIVO' ? 'border-rose-500/30 text-rose-300 bg-rose-500/10' : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                                }`}>
                                  {item.type}
                                </span>
                                <span className="text-violet-400 font-mono text-sm font-bold tracking-tight">#{item.report_id}</span>
                                <span className="text-white/20 text-xs font-light">•</span>
                                <span className="text-white/40 text-xs font-medium uppercase tracking-tight">{formatDate(item.date)}</span>
                              </div>
                              <p className="text-white/80 font-normal leading-relaxed text-sm md:text-base pr-12 line-clamp-2 md:line-clamp-none">
                                {item.action}
                              </p>
                              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic pt-1">Ejecutado por: {item.technician}</p>
                            </div>
                            
                            {/* ACCIONES DE HISTORIAL */}
                            <div className="flex gap-3 self-end md:self-center">
                              <button 
                                onClick={() => { setEditLogData(item); setIsEditLogModalOpen(true); }}
                                className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl border border-white/5 transition-all active:scale-95"
                                title="Editar registro"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteActivity(item)}
                                className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500/60 hover:text-white rounded-2xl border border-rose-500/20 transition-all active:scale-95"
                                title="Eliminar del historial"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-20 text-center rounded-[2rem] border border-dashed border-white/10">
                        <Activity size={40} className="text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 italic font-light">Este equipo aún no registra intervenciones en el servidor.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Registro de Historial (Log) */}
      {isEditLogModalOpen && editLogData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsEditLogModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0c111d] border border-white/10 rounded-[2.5rem] p-8 shadow-3xl">
             <header className="mb-8">
               <h3 className="text-2xl font-black text-white tracking-tight uppercase">Editar Registro Técnico</h3>
               <p className="text-violet-400 text-[10px] font-bold tracking-[0.3em] mt-1 italic">#{editLogData.report_id} • {editLogData.type}</p>
             </header>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Fecha de Intervención</label>
                   <input 
                      type="date" 
                      value={editLogData.date?.split('T')[0]} 
                      onChange={e => setEditLogData({...editLogData, date: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-violet-500 outline-none transition-all" 
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Descripción de la Actividad</label>
                   <textarea 
                      value={editLogData.action} 
                      onChange={e => setEditLogData({...editLogData, action: e.target.value.toUpperCase()})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-violet-500 h-32 outline-none transition-all resize-none font-light leading-relaxed uppercase" 
                      placeholder="..."
                   />
                </div>
             </div>
             <div className="mt-10 flex gap-4">
                <button onClick={() => setIsEditLogModalOpen(false)} className="flex-1 py-4 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleUpdateLog} className="flex-1 py-4 bg-violet-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all">Sincronizar Cambios</button>
             </div>
          </div>
        </div>
      )}

      {/* Modal Agregar (Supabase Insert) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-[2rem] p-4 md:p-6 lg:p-8 shadow-2xl">
             <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4 md:mb-6">Nuevo Registro BioMed</h3>
             <div className="space-y-4">
                <div className="group">
                   <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Equipo *</label>
                   <input type="text" value={newEqData.equipo} onChange={e => setNewEqData({...newEqData, equipo: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all uppercase" placeholder="DEFIBRILLADOR..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5 block">ID Único (Placa) *</label>
                      <input type="text" value={newEqData.id_unico} onChange={e => setNewEqData({...newEqData, id_unico: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-orange-200 focus:border-orange-500 transition-all font-mono" placeholder="1042..." />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Servicio</label>
                      <input type="text" value={newEqData.servicio} onChange={e => setNewEqData({...newEqData, servicio: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all uppercase" placeholder="URGENCIAS..." />
                   </div>
                </div>
             </div>
             <div className="mt-10 flex gap-4">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-white/40 font-medium hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleAddNewEq} className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Registrar Equipo</button>
             </div>
          </div>
        </div>
      )}

      {/* Modal Editar (Supabase Update) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-[#0a0f1a] w-full max-w-5xl h-[80vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 md:p-6 lg:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-md">
               <div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Editor Global de Ficha</h3>
                  <p className="text-white/40 text-sm mt-1">Modificando registro centralizado: <span className="text-indigo-300 font-mono">{editEqData.id_unico}</span></p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-white/40 hover:text-white transition-colors font-medium">Cancelar</button>
                  <button onClick={handleSaveEditEq} className="px-8 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2">
                     <Save size={18} /> Guardar Cambios
                  </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                  {Object.keys(editEqData).filter(k => k !== 'id' && k !== 'created_at').map((key) => (
                    <div key={key} className="space-y-2">
                       <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block ml-1">
                         {key === 'servicio' ? 'UBICACIÓN' : (key === 'ubicacion' ? 'DETALLE FÍSICO' : key.replace(/_/g,' '))}
                       </label>
                       <input 
                          type="text" 
                          value={editEqData[key] || ''} 
                          onChange={e => setEditEqData({...editEqData, [key]: e.target.value.toUpperCase()})} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-indigo-500/50 focus:bg-white/[0.07] outline-none transition-all placeholder:text-white/10"
                          placeholder="..."
                       />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
