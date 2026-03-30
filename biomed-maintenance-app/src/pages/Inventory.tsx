import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, X, Download, ShieldCheck, Wrench, Activity, Hash, Tag, Layers, Edit, Save } from 'lucide-react';
import rawInventoryData from '../data/inventory.json';

// Type assertion since we're importing raw JSON
const inventoryData = rawInventoryData as any[];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [localInventory, setLocalInventory] = useState<any[]>(inventoryData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEqData, setEditEqData] = useState<any>({});
  const [newEqData, setNewEqData] = useState({ Equipo: '', Marca: '', Modelo: '', NumeroSerie: '', Id_Unico: '', UBICACIÓN: '' });
  
  useEffect(() => {
    const saved = localStorage.getItem('custom_inventory');
    if (saved) {
      try {
        const customEquipments = JSON.parse(saved);
        setLocalInventory([...customEquipments, ...inventoryData]);
      } catch(e) {}
    }
  }, []);

  const handleAddNewEq = () => {
    if(!newEqData.Equipo || !newEqData.Id_Unico) return;
    const timestampedEq = { ...newEqData, estado: 'BUENO', RIESGO: 'I' };
    
    const saved = localStorage.getItem('custom_inventory');
    const customList = saved ? JSON.parse(saved) : [];
    customList.unshift(timestampedEq);
    localStorage.setItem('custom_inventory', JSON.stringify(customList));
    
    setLocalInventory(prev => [timestampedEq, ...prev]);
    setIsAddModalOpen(false);
    setNewEqData({ Equipo: '', Marca: '', Modelo: '', NumeroSerie: '', Id_Unico: '', UBICACIÓN: '' });
  };

  const handleSaveEditEq = () => {
    if(!editEqData['Id_Unico']) return;
    
    const saved = localStorage.getItem('custom_inventory');
    const customList = saved ? JSON.parse(saved) : [];
    
    const index = customList.findIndex((e:any) => e['Id_Unico'] === editEqData['Id_Unico']);
    if (index >= 0) {
      customList[index] = editEqData;
    } else {
      customList.push(editEqData);
    }
    localStorage.setItem('custom_inventory', JSON.stringify(customList));
    
    // Update local variables respecting the overriden ones
    const mergedData = inventoryData.map(i => {
       const override = customList.find((c:any) => c['Id_Unico'] === i['Id_Unico']);
       return override ? override : i;
    });
    const newCustoms = customList.filter((c:any) => !inventoryData.some(i => String(i['Id_Unico']) === String(c['Id_Unico'])));
    
    setLocalInventory([...newCustoms, ...mergedData]);
    
    // Update active modal view
    setSelectedEquipment(editEqData);
    setIsEditModalOpen(false);
  };
  
  // Filter and limit to 100 items for performance without a virtualized list
  const filteredData = useMemo(() => {
    let filtered = localInventory;
    
    if (searchTerm) {
      const lowerTheme = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        String(item['Equipo'] || '').toLowerCase().includes(lowerTheme) ||
        String(item['Id_Unico'] || '').toLowerCase().includes(lowerTheme) ||
        String(item['Marca'] || '').toLowerCase().includes(lowerTheme) ||
        String(item['Modelo'] || '').toLowerCase().includes(lowerTheme) ||
        String(item['UBICACIÓN'] || '').toLowerCase().includes(lowerTheme)
      );
    }
    
    // Limitar para rendimiento en vista general
    return filtered.slice(0, 150);
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
      await generateProfilePDF(selectedEquipment);
    } catch (error) {
       console.error("Error generando el PDF:", error);
    }
  };

  useEffect(() => {
    if (selectedEquipment) {
      setTimeout(() => {
        const savedImg = localStorage.getItem(`equip_img_${selectedEquipment['Id_Unico']}`);
        const img = document.getElementById('equip-img') as HTMLImageElement;
        const placeholder = document.getElementById('img-placeholder');
        if (img && placeholder) {
          if (savedImg) {
            img.src = savedImg;
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
          } else {
            img.src = '';
            img.classList.add('hidden');
            placeholder.classList.remove('hidden');
          }
        }
      }, 50);
    }
  }, [selectedEquipment]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedEquipment) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(`equip_img_${selectedEquipment['Id_Unico']}`, base64String);
        
        const img = document.getElementById('equip-img') as HTMLImageElement;
        const placeholder = document.getElementById('img-placeholder');
        if (img && placeholder) {
          img.src = base64String;
          img.classList.remove('hidden');
          placeholder.classList.add('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatExcelDate = (value: any) => {
    if (!value || String(value).toUpperCase() === 'NA' || String(value).trim() === '') return 'N/A';
    
    // Si ya es un formato legible (tiene guiones o slashes y no es solo un número)
    if (isNaN(Number(value)) && (String(value).includes('/') || String(value).includes('-'))) {
      return value;
    }

    const serial = Number(value);
    if (isNaN(serial)) return value;

    // Excel serial to JS Date (25569 is the offset between 1900 and 1970)
    const date = new Date((serial - 25569) * 86400 * 1000);
    
    // Ajustar por zona horaria para evitar desfases de un día
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto h-screen relative z-10">
      <header className="mb-12 flex justify-between items-end backdrop-blur-sm">
        <div>
          <h2 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-wide">
            Inventario de Equipos ({inventoryData.length} total)
          </h2>
          <p className="text-white/60 font-light mt-3 text-lg tracking-wide">
            Gestión de todo el parque tecnológico extraído del cuadro HUSJ.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-orange-300/50 flex items-center gap-2">
            <Plus size={18} /> Agregar Equipo
          </button>
        </div>
      </header>

      {/* Glassmorphism search and filter area */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-8 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por placa, nombre o marca..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white font-light placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all shadow-inner"
          />
        </div>
        <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-light tracking-wide hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2">
          <Filter size={18} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" /> Filtros
        </button>
      </div>

      {/* Main Table Area */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-1 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="w-full bg-black/10 rounded-[22px] overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
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
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <tr key={idx} onClick={() => setSelectedEquipment(item)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="py-4 px-6">
                        <span className="text-white/80 font-medium tracking-wide">{item['Id_Unico'] || '-'}</span>
                        <span className="block text-white/30 text-[10px] uppercase font-light mt-1">S/N: {item['NumeroSerie'] || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white/90 font-medium">{item['Equipo'] || 'Desconocido'}</p>
                        <p className="text-white/40 text-[11px] mt-1 font-light uppercase tracking-wide">
                          {item['Marca'] || 'S/M'} {item['Modelo'] ? `/ ${item['Modelo']}` : ''}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white/70 font-light text-sm">{item['UBICACIÓN'] || item['Servicio'] || 'No Asignada'}</p>
                        <p className="text-white/40 text-[10px] mt-1 uppercase font-light">{item['PROPIETARIO'] || ''}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full border text-[10px] tracking-wider uppercase font-medium ${getStatusStyle(item['Estado'])}`}>
                          {item['Estado'] || 'S/E'}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-sm uppercase tracking-wide ${getRiskStyle(item['RIESGO'])}`}>
                        {item['RIESGO'] || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-white/30 font-light tracking-wide">
                      No se encontraron equipos bajo ese criterio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Equipment Profile Modal (Hoja de Vida) */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedEquipment(null)}></div>
          <div className="relative bg-[#0a0f1a] w-full max-w-6xl h-[85vh] rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            {/* Ambient glows inside modal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="relative z-10 p-6 px-10 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Activity className="text-orange-400" size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-white/90">
                    {selectedEquipment['Equipo']}
                  </h3>
                  <p className="text-white/40 text-sm mt-1 tracking-wide font-light flex items-center gap-2">
                    <span className="text-amber-200/50">Activo Fijo:</span> {selectedEquipment['Id_Unico']} 
                    <span className="text-white/20 px-2">|</span> 
                    <span className="text-amber-200/50">Servicio:</span> {selectedEquipment['Servicio'] || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setEditEqData(selectedEquipment); setIsEditModalOpen(true); }}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/40 flex items-center gap-2 group"
                >
                  <Edit size={16} className="group-hover:rotate-12 transition-transform" /> Editar Toda la Ficha
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-orange-300/40 flex items-center gap-2 group"
                >
                  <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Exportar a PDF
                </button>
                <button onClick={() => setSelectedEquipment(null)} className="p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors border border-white/5">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Premium Bento Grid Layout */}
            <div className="relative z-10 flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="flex gap-8 min-h-full pb-10">
                
                {/* Lado Izquierdo: Fotografía y Resumen */}
                <div className="w-[350px] flex flex-col gap-6 shrink-0">
                  {/* Caja de Imagen Dinámica */}
                  <div className="relative w-full aspect-square rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] overflow-hidden group flex items-center justify-center shadow-inner">
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center text-white/40 hover:text-white/80 hover:bg-black/40 transition-all z-10">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <div id="img-placeholder" className="flex flex-col items-center gap-3">
                        <Plus className="w-12 h-12 mb-2 text-white/20 group-hover:text-orange-400 group-hover:scale-110 transition-all" />
                        <span className="font-light tracking-wide text-sm bg-black/40 px-3 py-1 rounded text-center">Toca para cambiar la foto</span>
                      </div>
                    </label>
                    <img id="equip-img" src="" alt="Equipo" className="w-full h-full object-contain object-center p-6 hidden absolute inset-0 transition-opacity duration-300 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] filter contrast-125" />
                    
                    {/* Badge lateral Status flotante */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className={`px-4 py-1.5 rounded-full border text-xs tracking-wider uppercase font-bold shadow-xl backdrop-blur-md ${getStatusStyle(selectedEquipment['Estado'])}`}>
                        {selectedEquipment['Estado'] || 'Desconocido'}
                      </span>
                    </div>
                  </div>

                  {/* Resumen Principal Bento */}
                  <div className="bg-white/5 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-sm relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <a 
                          href={`https://www.google.com/search?q=manual+tecnico+especificaciones+${selectedEquipment['Marca'] || ''}+${selectedEquipment['Modelo'] || ''}+filetype:pdf`}
                          target="_blank" rel="noreferrer"
                          className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 p-2 rounded-xl flex items-center gap-2 border border-indigo-500/30 transition-all text-[10px] uppercase tracking-wider font-bold"
                          title="Buscar especificaciones técnicas en Google"
                       >
                          <Search size={12} /> Auto-Completar Web
                       </a>
                    </div>
                    <h4 className="text-xs uppercase tracking-widest text-white/40 mb-5 pb-3 border-b border-white/10">Datos Vitales</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase font-light tracking-wider">Marca</p>
                        <p className="text-white/90 font-medium text-lg">{selectedEquipment['Marca'] || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase font-light tracking-wider">Modelo</p>
                        <p className="text-white/90 font-medium text-lg">{selectedEquipment['Modelo'] || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase font-light tracking-wider">Número de Serie</p>
                        <p className="text-orange-300 font-mono tracking-wider">{selectedEquipment['NumeroSerie'] || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Pestañas de Especificaciones */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* Bento Grid Superior */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Caja Ubicación */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-[1.5rem] p-6 shadow-lg">
                      <h4 className="text-indigo-400 text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Layers size={14} /> Localización
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-light text-sm">Ubicación Actual</span>
                          <span className="text-white/90 font-medium">{selectedEquipment['UBICACIÓN'] || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-light text-sm">Propietario</span>
                          <span className="text-white/90 font-medium">{selectedEquipment['PROPIETARIO'] || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-white/40 font-light text-sm">Nivel de Riesgo</span>
                          <span className={`${getRiskStyle(selectedEquipment['RIESGO'])}`}>{selectedEquipment['RIESGO'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Caja Legal/Regulatorio */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[1.5rem] p-6 shadow-lg">
                      <h4 className="text-emerald-400 text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} /> Regulatorio
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-light text-sm">Registro INVIMA</span>
                          <span className="text-amber-200/80 font-mono text-sm">{selectedEquipment['REG. INVIMA'] || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-light text-sm">Garantía</span>
                          <span className="text-white/90 font-medium">{selectedEquipment['GARANTÍA'] || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-white/40 font-light text-sm">Estrategia Mtto.</span>
                          <span className="text-white/90 font-light">{selectedEquipment['ESTRATEGIA DE MANTTO'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fila Inferior Amplia: Mantenimiento y Calibración */}
                  <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-8 shadow-xl relative overflow-hidden flex-1">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-400/5 blur-[80px] rounded-full point-events-none"></div>
                    <h4 className="text-white/80 text-sm tracking-widest uppercase mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                      <Wrench size={16} className="text-orange-400" /> Planilla de Servicio y Calibración
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                      <div className="group">
                        <p className="text-white/30 text-[10px] uppercase font-light tracking-wide mb-1">Responsable Mantenimiento</p>
                        <p className="text-white/90 text-sm border-l-2 border-white/10 pl-3 group-hover:border-orange-400/50 transition-colors py-1">{selectedEquipment['RESPONSABLE MTTO'] || 'N/A'}</p>
                      </div>
                      <div className="group">
                        <p className="text-white/30 text-[10px] uppercase font-light tracking-wide mb-1">Frecuencia Preventiva</p>
                        <p className="text-white/90 text-sm border-l-2 border-white/10 pl-3 group-hover:border-orange-400/50 transition-colors py-1">{selectedEquipment['FRECUENCIA DE MANTENIMIENTO'] || 'N/A'}</p>
                      </div>
                      <div className="group">
                        <p className="text-white/30 text-[10px] uppercase font-light tracking-wide mb-1">Requiere Calibración</p>
                        <p className="text-white/90 text-sm border-l-2 border-white/10 pl-3 group-hover:border-emerald-400/50 transition-colors py-1">{selectedEquipment['¿REQUIERE CALIBRACIÓN?'] || 'N/A'}</p>
                      </div>
                      <div className="group">
                        <p className="text-white/30 text-[10px] uppercase font-light tracking-wide mb-1">Certificado Vigente</p>
                        <p className="text-white/90 text-sm border-l-2 border-white/10 pl-3 group-hover:border-emerald-400/50 transition-colors py-1">{selectedEquipment['CERTIFICADO DE CALIBRACIÓN'] || 'N/A'}</p>
                      </div>
                      
                      {/* Nuevas cajas de fecha de calibración */}
                      <div className="group border-l-2 border-white/10 pl-3 hover:border-blue-400/50 transition-colors py-1">
                        <p className="text-white/30 text-[10px] uppercase font-light tracking-wide mb-1">Fecha de Calibración</p>
                        <p className="text-blue-300 font-mono text-base">{formatExcelDate(selectedEquipment['FECHA DE CALIBRACIÓN'])}</p>
                      </div>

                      <div className="group bg-rose-500/5 rounded-xl p-4 border border-rose-500/10">
                        <p className="text-rose-400/70 text-[10px] uppercase font-bold tracking-wide mb-1">Fecha de Vencimiento de Calibración</p>
                        <p className="text-rose-300 font-mono text-lg">{formatExcelDate(selectedEquipment['FECHA DE VENCIMIENTO DE CALIBRACIÓN'])}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agregar Equipo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white/50 rounded-full transition-all">
               <X size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-white mb-2">Anexar Nuevo Equipo</h3>
            <p className="text-white/40 text-sm mb-6">Completa los datos vitales para registrar temporalmente.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2 block">Nombre del Equipo</label>
                <input type="text" value={newEqData.Equipo} onChange={e => setNewEqData({...newEqData, Equipo: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50" placeholder="Ej. MONITOR MULTIPARAMETRICO" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2 block">Marca</label>
                  <input type="text" value={newEqData.Marca} onChange={e => setNewEqData({...newEqData, Marca: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2 block">Modelo</label>
                  <input type="text" value={newEqData.Modelo} onChange={e => setNewEqData({...newEqData, Modelo: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2 block">Número de Serie</label>
                  <input type="text" value={newEqData.NumeroSerie} onChange={e => setNewEqData({...newEqData, NumeroSerie: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2 block">Activo Fijo (ID Único) *</label>
                  <input type="text" value={newEqData.Id_Unico} onChange={e => setNewEqData({...newEqData, Id_Unico: e.target.value})} className="w-full bg-black/30 border border-orange-500/30 rounded-xl px-4 py-3 text-orange-200 focus:outline-none focus:border-orange-500" placeholder="Ej. 1045" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2 block">Ubicación / Servicio</label>
                <input type="text" value={newEqData.UBICACIÓN} onChange={e => setNewEqData({...newEqData, UBICACIÓN: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50" placeholder="Ej. URGENCIAS" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 font-medium transition-colors">Cancelar</button>
              <button onClick={handleAddNewEq} className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">Guardar Equipo</button>
            </div>
          </div>
        </div>
      )}

      {/* Editar Equipo Exaustivo Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-[#0a0f1a] w-full max-w-5xl h-[80vh] rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            <div className="relative z-10 p-6 px-10 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 rounded-2xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Edit className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white/90">Editar Ficha Técnica Completa</h3>
                  <p className="text-white/40 text-sm mt-1 tracking-wide font-light">
                    Actualizando el Activo Fijo: <span className="text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">{editEqData['Id_Unico']}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 font-medium transition-colors">Cancelar</button>
                <button onClick={handleSaveEditEq} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-105 text-white font-medium shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all rounded-xl flex items-center gap-2">
                   <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Extraer todas las llaves formales de la estructura principal para edición exaustiva */}
                {Object.keys(inventoryData[0] || {}).map((key) => {
                  if (key.startsWith('equip_img')) return null; // Saltar metadatos internos
                  if (/^(P|C)\d*$/.test(key) && key !== 'PROPIETARIO' && key !== 'CERTIFICADO DE CALIBRACIÓN') return null; // Ignorar columnas P/C del cronograma mensual (P2, C3, etc)
                  
                  return (
                    <div key={key} className="group">
                      <label className="text-[11px] font-semibold text-indigo-200/50 uppercase tracking-widest mb-1.5 block group-focus-within:text-indigo-400 transition-colors">
                        {key}
                      </label>
                      <input 
                        type="text" 
                        value={editEqData[key] || ''} 
                        onChange={e => setEditEqData({...editEqData, [key]: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10 hover:border-white/20 transition-all font-light" 
                        placeholder="..." 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
