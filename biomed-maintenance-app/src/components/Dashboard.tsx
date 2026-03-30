import { useState, useEffect } from 'react';
import { Activity, Beaker, ClipboardList, ShieldCheck, HeartPulse, HardDrive, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEquipments: 0,
        maintenanceDone: 0,
        pendingReports: 0,
        securityIssues: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // 1. Total de equipos (Navegado a Supabase)
                const { count: eqCount } = await supabase
                    .from('equipments')
                    .select('*', { count: 'exact', head: true });

                // 2. Mantenimientos realizados este mes
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0,0,0,0);

                const { count: logCount } = await supabase
                    .from('maintenance_logs')
                    .select('*', { count: 'exact', head: true })
                    .gte('executed_at', startOfMonth.toISOString());

                setStats({
                   totalEquipments: eqCount || 0,
                   maintenanceDone: logCount || 0,
                   pendingReports: 12, // Simulado (podría ser otra consulta)
                   securityIssues: 3   // Simulado
                });
            } catch (e) {
                console.error("Error fetching stats:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10 custom-scrollbar">
            {/* Header section with glassmorphism */}
            <header className="mb-12 flex justify-between items-end animate-in fade-in slide-in-from-top duration-700">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-tight">
                        BioMed HUSJ <span className="text-white/20 font-light mx-2">|</span> Dashboard
                    </h2>
                    <p className="text-white/60 font-light mt-3 text-lg tracking-wide uppercase flex items-center gap-2">
                       <Activity size={16} className="text-orange-400 animate-pulse" /> Estado de Gestión Cloud
                    </p>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-2xl">
                    <button className="px-5 py-2 rounded-xl bg-orange-500 text-white font-medium shadow-[0_0_20px_rgba(245,158,11,0.3)]">Global</button>
                    <button className="px-5 py-2 rounded-xl text-white/50 hover:text-white transition-all">Servicios</button>
                </div>
            </header>

            {/* KPI Section with Premium Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-10">
                <StatCard 
                    label="Parque Tecnológico" 
                    value={loading ? '...' : stats.totalEquipments.toLocaleString()} 
                    trend="+2" 
                    icon={<HardDrive className="text-orange-400" />} 
                    color="from-orange-500/20 to-amber-500/5"
                    borderColor="border-orange-500/20"
                />
                <StatCard 
                    label="Mtto. Realizado (Mes)" 
                    value={loading ? '...' : stats.maintenanceDone} 
                    trend="Meta: 80" 
                    icon={<ClipboardList className="text-emerald-400" />} 
                    color="from-emerald-500/20 to-teal-500/5"
                    borderColor="border-emerald-500/20"
                />
                <StatCard 
                    label="Informes Pendientes" 
                    value={stats.pendingReports} 
                    trend="Critico" 
                    icon={<Beaker className="text-amber-400" />} 
                    color="from-amber-500/20 to-yellow-500/5"
                    borderColor="border-amber-500/20"
                />
                <StatCard 
                    label="Alertas Tecnovigilancia" 
                    value={stats.securityIssues} 
                    trend="Nivel 1" 
                    icon={<ShieldCheck className="text-indigo-400" />} 
                    color="from-indigo-500/20 to-purple-500/5"
                    borderColor="border-indigo-500/20"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
                {/* Main Action area */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4 md:p-6 lg:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[80px] group-hover:bg-orange-500/20 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-4">Cronograma Vigente 2026</h3>
                            <p className="text-white/40 text-lg mb-8 max-w-xl font-light">Has completado el 65% de los mantenimientos preventivos programados para el primer trimestre en el área de Urgencias.</p>
                            <div className="w-full bg-white/5 h-3 rounded-full mb-8 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                               <button className="px-8 py-3 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition-all">Ver Cronograma</button>
                               <button className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Exportar Datos</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Dashboard info */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4 md:p-6 lg:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-h-[500px]">
                    <h4 className="text-xl font-semibold text-white mb-8 flex items-center gap-1.5">
                       <HeartPulse className="text-orange-400" size={20} /> Salud de los Activos
                    </h4>
                    <div className="space-y-6">
                        <HealthItem label="Monitores" active={94} issues={2} />
                        <HealthItem label="Bombas Infusión" active={150} issues={5} />
                        <HealthItem label="Desfibriladores" active={12} issues={0} />
                        <HealthItem label="Gases Medicinales" active={88} issues={1} />
                        <div className="pt-6 border-t border-white/5 mt-8">
                           <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                             <AlertTriangle className="mb-3" />
                             <p className="text-xs font-bold uppercase tracking-widest mb-1">Tecnovigilancia</p>
                             <p className="text-sm font-light">Se detectó alerta INVIMA #124 para ventiladores SERVO-I. Revisar número de lote.</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, trend, icon, color, borderColor }: any) => (
  <div className={`p-4 md:p-6 lg:p-8 bg-gradient-to-br ${color} border ${borderColor} rounded-[2rem] backdrop-blur-xl shadow-lg group hover:scale-[1.02] transition-all duration-500`}>
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/30 transition-all">
        {icon}
      </div>
      <span className="text-[10px] py-1 px-3 bg-white/10 rounded-full text-white/50 font-bold uppercase tracking-[0.15em]">{trend}</span>
    </div>
    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-bold text-white tracking-tighter">{value}</span>
    </div>
  </div>
);

const HealthItem = ({ label, active, issues }: any) => (
  <div className="flex justify-between items-center group">
    <div>
      <p className="text-white font-medium text-sm mb-1">{label}</p>
      <div className="flex items-center gap-2">
         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
         <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{active} Operativos</p>
      </div>
    </div>
    {issues > 0 ? (
      <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold">-{issues}</span>
    ) : (
      <div className="text-emerald-500">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
    )}
  </div>
);

export default Dashboard;
