import { useState, useEffect } from 'react';
import { 
  Activity, ClipboardList, HardDrive, 
  Beaker, ShieldCheck, HeartPulse, 
  AlertTriangle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceConsolidated from './ServiceConsolidated';
import EquipmentsModal from './EquipmentsModal';

interface ServiceGroup {
    name: string;
    count: number;
    equipments: any[];
}

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'SERVICIOS'>('GLOBAL');
    const [equipments, setEquipments] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<ServiceGroup | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [stats, setStats] = useState({
        totalEquipments: 0,
        maintenanceDone: 0,
        pendingReports: 0,
        securityIssues: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: eqData, error: eqError } = await supabase
                    .from('equipments')
                    .select('id, id_unico, equipo, servicio, ubicacion, marca, modelo, estado, riesgo');

                if (eqError) throw eqError;
                setEquipments(eqData || []);

                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0,0,0,0);

                const { count: logCount } = await supabase
                    .from('maintenance_logs')
                    .select('*', { count: 'exact', head: true })
                    .gte('executed_at', startOfMonth.toISOString());

                setStats({
                   totalEquipments: eqData?.length || 0,
                   maintenanceDone: logCount || 0,
                   pendingReports: 12,
                   securityIssues: 3
                });
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleServiceClick = (service: ServiceGroup) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 p-3 md:p-6 lg:p-10 overflow-y-auto min-h-0 relative z-10 custom-scrollbar">
            {/* Header section with glassmorphism */}
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top duration-700 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-500 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] tracking-tight">
                        BioMed HUSJ <span className="text-white/20 font-light mx-2 hidden md:inline">|</span> Dashboard
                    </h2>
                    <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide uppercase flex items-center gap-2">
                       <Activity size={16} className="text-orange-400 animate-pulse" /> Estado de Gestión Cloud
                    </p>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-2xl w-full md:w-auto overflow-hidden">
                    <button 
                        onClick={() => setActiveTab('GLOBAL')}
                        className={`flex-1 md:flex-none px-5 py-2 rounded-xl font-medium transition-all text-sm md:text-base ${
                            activeTab === 'GLOBAL' 
                            ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                            : 'text-white/50 hover:text-white'
                        }`}
                    >
                        Global
                    </button>
                    <button 
                        onClick={() => setActiveTab('SERVICIOS')}
                        className={`flex-1 md:flex-none px-5 py-2 rounded-xl font-medium transition-all text-sm md:text-base ${
                            activeTab === 'SERVICIOS' 
                            ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                            : 'text-white/50 hover:text-white'
                        }`}
                    >
                        Servicios
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'GLOBAL' ? (
                    <motion.div 
                        key="global"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* KPI Section with Premium Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
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
                    </motion.div>
                ) : (
                    <motion.div 
                        key="servicios"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                <p className="text-white/40 uppercase font-black tracking-widest text-xs">Consolidando unidades...</p>
                            </div>
                        ) : (
                            <ServiceConsolidated 
                                equipments={equipments} 
                                onServiceClick={handleServiceClick} 
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <EquipmentsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serviceName={selectedService?.name || ''}
                equipments={selectedService?.equipments || []}
            />
        </div>
    );
};

// --- Sub-components (StatCard, HealthItem) ---

const StatCard = ({ label, value, trend, icon, color, borderColor }: any) => (
    <div className={`bg-gradient-to-br ${color} border ${borderColor} rounded-[2.5rem] p-6 backdrop-blur-2xl shadow-xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between`}>
        <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-150 transition-all duration-700">
            {icon}
        </div>
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                {icon}
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{trend}</span>
        </div>
        <div>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
           <p className="text-3xl md:text-4xl font-semibold text-white tracking-tighter">{value}</p>
        </div>
    </div>
);

const HealthItem = ({ label, active, issues }: any) => (
    <div className="group">
        <div className="flex justify-between items-end mb-2">
            <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">{active} Activos</p>
            </div>
            <p className={`text-xs font-bold ${issues > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {issues > 0 ? `${issues} Alertas` : 'Óptimo'}
            </p>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full ${issues > 0 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                style={{ width: `${Math.max(10, 100 - (issues * 10))}%` }}
            ></div>
        </div>
    </div>
);

export default Dashboard;
