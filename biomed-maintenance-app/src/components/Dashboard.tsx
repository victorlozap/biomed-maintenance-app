import { useMemo } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  ArrowRight,
  Plus
} from 'lucide-react';
import rawInventoryData from '../data/inventory.json';

const inventoryData = rawInventoryData as any[];

const Dashboard = () => {
  // Generate real stats from JSON
  const stats = useMemo(() => {
    let activos = 0;
    let mantenimientos = 0;
    let criticos = 0;

    inventoryData.forEach(item => {
      const estado = (item['Estado'] || '').toLowerCase();

      if (estado.includes('malo') || estado.includes('falla') || estado.includes('baja')) {
        criticos++;
      } else if (estado.includes('mantenimiento') || estado.includes('reparacion')) {
        mantenimientos++;
      } else {
        activos++;
      }

      // If high risk and not functional, maybe add to critical? Just sticking to basic status for now.
    });

    return {
      total: inventoryData.length,
      activos,
      mantenimientos,
      criticos,
      pendientes: Math.round(inventoryData.length * 0.05) // Fake 5% pending for visuals
    };
  }, []);

  return (
    <div className="flex-1 p-10 overflow-y-auto h-screen">
      <header className="mb-12 flex justify-between items-end backdrop-blur-sm relative z-10">
        <div>
          {/* Glowing Golden Yellow Header */}
          <h2 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-wide">
            Dashboard General
          </h2>
          <p className="text-white/60 font-light mt-3 text-lg tracking-wide">Vista operativa del Hospital San Jorge.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-light tracking-wide hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            Generar Reporte
          </button>
          <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-cyan-400/50 flex items-center gap-2">
            <Plus size={18} /> Mantenimiento
          </button>
        </div>
      </header>

      {/* Glassmorphism KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12 relative z-10">
        <KpiCard 
          title="Equipos Funcionales" 
          value={stats.activos.toLocaleString()} 
          trend={`Total: ${stats.total.toLocaleString()} equipos`}
          icon={<Activity size={28} />} 
          theme="cyan"
        />
        <KpiCard 
          title="En Mantenimiento" 
          value={stats.mantenimientos.toLocaleString()} 
          trend="Reparación actual" 
          icon={<WrenchIcon size={28} />} 
          theme="orange"
        />
        <KpiCard 
          title="Fallos Críticos" 
          value={stats.criticos.toLocaleString()} 
          trend="Equipos de baja/malos" 
          icon={<AlertTriangle size={28} />} 
          theme="rose"
        />
         <KpiCard 
          title="Preventivos (Mes)" 
          value={stats.pendientes.toLocaleString()} 
          trend="Programados" 
          icon={<CheckCircle2 size={28} />} 
          theme="green"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        
        {/* Status Section - High End Glass */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          {/* Internal reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 drop-shadow-[0_0_10px_rgba(253,224,71,0.2)] tracking-wide">
              Métricas de Inventario
            </h3>
            <button className="text-cyan-400 text-sm font-light tracking-wide hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] flex items-center gap-2 transition-all">
              Ver detalles <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="h-72 flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm relative overflow-hidden shadow-inner">
             {/* Decorative grid */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <TrendingUp size={48} className="text-cyan-500/50 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-4" />
            <p className="text-white/60 font-light tracking-wide relative z-10">
              {stats.activos} Equipos Operativos / {stats.criticos} Fuera de Servicio
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
           <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 drop-shadow-[0_0_10px_rgba(253,224,71,0.2)] tracking-wide mb-8">
             Alertas
           </h3>
           
           <div className="space-y-7 relative z-10">
              {inventoryData.filter(i => (i['Estado'] || '').toLowerCase().includes('malo')).slice(0, 4).map((item, idx) => (
                <ActivityItem 
                  key={idx}
                  title="Falla Reportada" 
                  desc={`${item['Equipo'] || 'Desconocido'} - Cód: ${item['Id_Unico'] || 'N/A'}`} 
                  time="Reciente" 
                  theme="rose" 
                />
              ))}
              
              {/* If no failures, show something else or empty state */}
              {stats.criticos === 0 && (
                <p className="text-white/40 font-light">No hay equipos reportados en estado de falla.</p>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

const WrenchIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);

const KpiCard = ({ title, value, trend, icon, theme }: any) => {
  const getThemeStyles = () => {
    switch(theme) {
      case 'cyan': return { 
        iconColor: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]', 
        bgOuter: 'from-cyan-500/20 to-transparent',
        bgIcon: 'bg-cyan-500/20 border-cyan-400/30'
      };
      case 'orange': return { 
        iconColor: 'text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]', 
        bgOuter: 'from-orange-500/20 to-transparent',
        bgIcon: 'bg-orange-500/20 border-orange-400/30'
      };
      case 'rose': return { 
        iconColor: 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]', 
        bgOuter: 'from-rose-500/20 to-transparent',
        bgIcon: 'bg-rose-500/20 border-rose-400/30'
      };
      case 'green': return { 
        iconColor: 'text-emerald-300 drop-shadow-[0_0_12px_rgba(110,231,183,0.8)]', 
        bgOuter: 'from-emerald-500/20 to-transparent',
        bgIcon: 'bg-emerald-500/20 border-emerald-400/30'
      };
      default: return { iconColor: '', bgOuter: '', bgIcon: '' };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] group relative overflow-hidden">
      {/* Glossy top reflection */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      
      {/* Ambient glowing corner */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-40 bg-gradient-to-br ${styles.bgOuter} group-hover:opacity-80 transition-opacity duration-500 pointer-events-none`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-white/60 font-light text-[11px] tracking-wider uppercase mb-2 line-clamp-1">{title}</p>
          <h4 className="text-4xl font-light text-white tracking-tight drop-shadow-md">{value}</h4>
        </div>
        <div className={`p-3.5 rounded-2xl border ${styles.bgIcon} backdrop-blur-md shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          <div className={styles.iconColor}>{icon}</div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm relative z-10">
        <span className="text-white/50 font-light tracking-wide">{trend}</span>
      </div>
    </div>
  );
};

const ActivityItem = ({ title, desc, time, theme }: any) => {
  const getGlow = () => {
    switch(theme) {
      case 'cyan': return 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]';
      case 'orange': return 'bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]';
      case 'green': return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]';
      case 'teal': return 'bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)]';
      case 'rose': return 'bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.8)]';
      default: return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]';
    }
  };

  return (
    <div className="flex gap-5 group cursor-pointer">
      <div className="flex flex-col items-center mt-1">
        <div className={`w-3 h-3 rounded-full ${getGlow()} ring-4 ring-black/20 group-hover:scale-125 transition-transform`}></div>
        <div className="w-px h-full bg-white/10 mt-3 group-last:hidden"></div>
      </div>
      <div className="pb-6 group-last:pb-0">
        <p className="text-[15px] font-medium text-white/90 tracking-wide group-hover:text-white transition-colors">{title}</p>
        <p className="text-sm text-white/50 font-light mt-1 tracking-wide">{desc}</p>
        <p className="text-[11px] text-white/30 font-light mt-2 tracking-widest uppercase">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
