import React from 'react';
import { Wrench, AlertTriangle, PenTool } from 'lucide-react';

const Corrective = () => {
  return (
    <div className="flex-1 p-10 overflow-y-auto h-screen relative z-10">
      <header className="mb-12 flex justify-between items-end backdrop-blur-sm">
        <div>
          <h2 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-wide">
            Mantenimiento Correctivo
          </h2>
          <p className="text-white/60 font-light mt-3 text-lg tracking-wide">
            Gestión de solicitudes de servicio, fallas y reparaciones.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(167,139,250,0.4)] border border-violet-400/50 flex items-center gap-2">
            <AlertTriangle size={18} /> Reportar Falla
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-400 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)] tracking-wide mb-6">
            Casos Abiertos (Críticos)
          </h3>
          <div className="space-y-4">
            <IssueItem equip="Monitor Modular" code="HSJ-1150" issue="Pantalla táctil no responde" time="Hace 1 hora" />
            <IssueItem equip="Electrocardiógrafo" code="HSJ-4432" issue="Error en derivación V2" time="Ayer 10:30" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-center items-center text-center">
          <PenTool size={48} className="text-fuchsia-500/50 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] mb-6" />
          <h4 className="text-xl text-white/90 font-medium mb-2">Nuevo Registro Correctivo</h4>
          <p className="text-white/50 font-light text-sm max-w-sm mb-8">
            Diligencia el formato de orden de servicio tras una reparación con base en el protocolo del Hospital.
          </p>
          <button className="px-8 py-4 rounded-2xl bg-white/10 border border-violet-500/30 text-violet-300 font-light tracking-wide hover:bg-violet-500/20 hover:border-violet-400/50 transition-all shadow-[0_0_20px_rgba(139,92,246,0.1)] flex items-center gap-3">
            <Wrench size={20} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" /> Iniciar Orden
          </button>
        </div>
      </div>
    </div>
  );
};

const IssueItem = ({ equip, code, issue, time }: any) => (
  <div className="p-4 bg-black/20 border border-rose-500/20 rounded-2xl hover:bg-rose-500/10 cursor-pointer transition-colors flex justify-between items-center group">
    <div>
      <h5 className="text-white/90 font-medium group-hover:text-rose-200 transition-colors">{equip}</h5>
      <p className="text-white/40 text-xs mt-1 font-light tracking-wider uppercase">Cód: {code}</p>
      <p className="text-rose-400/80 text-sm mt-2 font-light">{issue}</p>
    </div>
    <div className="text-white/40 text-xs font-light tracking-widest uppercase text-right">
      <span className="block mb-2 px-2 py-1 bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30">Urgente</span>
      {time}
    </div>
  </div>
);

export default Corrective;
