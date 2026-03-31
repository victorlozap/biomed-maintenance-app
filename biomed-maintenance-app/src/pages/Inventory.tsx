import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, X, Loader2, RefreshCw, Activity, Edit, Download, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [localInventory, setLocalInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    if (typeof val === 'number' || (!isNaN(val) && !val.toString().includes('-'))) {
      const excelDate = parseFloat(val as string);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (typeof val === 'string' && val.includes('-')) {
      const [year, month, day] = val.split('-');
      return `${day}/${month}/${year}`;
    }
    return val;
  };
  
  // Cargar datos desde Supabase
  const fetchEquipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('id_unico', { ascending: true });

    if (error) {
      console.error('Error fetching equipments:', error);
    } else {
      setLocalInventory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

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
    if (!searchTerm) return localInventory.slice(0, 150);
    
    const lowerTheme = searchTerm.toLowerCase();
    return localInventory.filter(item => 
      String(item.equipo || '').toLowerCase().includes(lowerTheme) ||
      String(item.id_unico || '').toLowerCase().includes(lowerTheme) ||
      String(item.marca || '').toLowerCase().includes(lowerTheme) ||
      String(item.modelo || '').toLowerCase().includes(lowerTheme) ||
      String(item.ubicacion || '').toLowerCase().includes(lowerTheme) ||
      String(item.servicio || '').toLowerCase().includes(lowerTheme)
    ).slice(0, 150);
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
                    onClick={() => document.getElementById('file-input-id')?.click()}
                    className="bg-white/5 border border-white/5 rounded-3xl p-4 md:p-6 h-full min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-orange-500/40 transition-all duration-300 shadow-xl"
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
                        <img 
                          src={selectedEquipment.foto_url} 
                          alt={selectedEquipment.equipo} 
                          className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                        />
                      ) : (
                        <div className="relative z-10 w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mb-4 text-white/20 group-hover:scale-110 group-hover:text-orange-400 group-hover:border-orange-500/50 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                          <Activity size={40} className="transition-opacity" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      
                      <div className="relative z-20 flex flex-col items-center">
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-center group-hover:text-white transition-colors drop-shadow-md">
                          {selectedEquipment.foto_url ? 'Imagen de Equipo' : 'Sin Imagen BioMed'}
                        </p>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('file-input-id')?.click();
                          }}
                          className="mt-4 px-4 py-1.5 bg-black/60 hover:bg-orange-500 border border-white/10 group-hover:border-white/30 rounded-lg text-[9px] text-white uppercase font-bold tracking-wider transition-all backdrop-blur-md pointer-events-auto"
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
                          <p className="text-indigo-300/50 text-[10px] uppercase font-bold tracking-wider">Servicio</p>
                          <p className="text-white text-base font-medium leading-relaxed">{selectedEquipment.servicio || 'N/A'}</p>
                        </div>
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 flex flex-col items-start gap-1">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Ubicación</p>
                          <p className="text-white text-base font-medium leading-relaxed">{selectedEquipment.ubicacion || 'Sala 8'}</p>
                        </div>
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Clase de Riesgo</p>
                          <p className={`${getRiskStyle(selectedEquipment.riesgo)} text-lg uppercase font-bold`}>{selectedEquipment.riesgo || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Calibración y Mantenimiento */}
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
              </div>
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
                       <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block ml-1">{key.replace(/_/g,' ')}</label>
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
