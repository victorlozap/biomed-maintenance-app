import { X, Search, Activity, Package, Monitor, HardDrive, Zap, ShieldCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getStatusStyle = (estado: string) => {
  const status = String(estado || '').toLowerCase();
  if (status.includes('bueno') || status.includes('funcional')) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
  if (status.includes('mantenimiento') || status.includes('reparacion')) return "bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]";
  if (status.includes('malo') || status.includes('baja') || status.includes('falla')) return "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
  return "bg-slate-500/20 text-slate-300 border-slate-500/30";
};

const getRiskStyle = (risk: string) => {
  const r = String(risk || '').toLowerCase();
  if (r.includes('iii')) return "text-rose-400 font-bold drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]";
  if (r.includes('ii')) return "text-amber-400 font-bold drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]";
  return "text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]";
};

interface EquipmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  equipments: any[];
}

const EquipmentsModal = ({ isOpen, onClose, serviceName, equipments }: EquipmentsModalProps) => {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return equipments;
    const lower = q.toLowerCase();
    return equipments.filter(e => 
      e.equipo?.toLowerCase().includes(lower) || 
      e.id_unico?.toLowerCase().includes(lower) ||
      e.serie?.toLowerCase().includes(lower)
    );
  }, [q, equipments]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#0c111d] w-full h-full md:h-[90vh] md:max-w-7xl md:rounded-[3rem] border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                  <Activity size={20} className="animate-pulse" />
                </span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Inventario Localizado HUSJ</span>
              </div>
              <h3 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tighter">
                {serviceName}
              </h3>
              <p className="text-sm md:text-lg text-white/30 font-light mt-1 md:mt-2">Extensión de equipos para el área técnica de biomedicina.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:flex-none md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input 
                    value={q} onChange={e => setQ(e.target.value.toUpperCase())}
                    placeholder="Filtrar por placa o equipo..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/20 shadow-inner"
                  />
               </div>
               <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-500 text-white transition-all rounded-2xl border border-white/10 shadow-lg active:scale-90">
                 <X size={24} />
               </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar bg-gradient-to-b from-transparent to-black/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  key={item.id || idx} 
                  className="group bg-white/2 border border-white/5 hover:border-white/20 rounded-[2.5rem] p-6 backdrop-blur-2xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                    <Monitor size={60} />
                  </div>

                  <header className="flex justify-between items-start mb-6">
                    <span className="text-orange-400 font-mono text-lg font-black tracking-tight drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">#{item.id_unico}</span>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${getStatusStyle(item.estado)}`}>
                      {item.estado}
                    </span>
                  </header>

                  <h5 className="text-xl font-bold text-white mb-2 leading-tight pr-10">{item.equipo}</h5>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                       <Zap className="text-indigo-400" size={14} />
                       <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Identificación Técnica</p>
                          <p className="text-sm text-white/80 font-semibold truncate leading-tight uppercase">{item.marca} / {item.modelo || 'S/M'}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                       <ShieldCheck className="text-emerald-400" size={14} />
                       <div className="flex-1">
                          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Ubicación y Riesgo</p>
                          <div className="flex justify-between items-center pr-2">
                             <p className="text-sm text-white/80 font-semibold uppercase leading-tight truncate">{item.ubicacion || 'General'}</p>
                             <span className={`text-sm ${getRiskStyle(item.riesgo)} uppercase font-black`}>{item.riesgo}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3 text-white/20 group-hover:text-emerald-400/50 transition-colors">
                    <Package size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Activo Controlado HUSJ</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>
                </motion.div>
              ))}
              
              {filtered.length === 0 && (
                <div className="col-span-full py-40 text-center text-white/20 italic font-light text-2xl tracking-tight"> No se encontraron equipos en esta unidad clínica con ese criterio. </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EquipmentsModal;
