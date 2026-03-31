import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Target,
  RefreshCw,
  Search,
  Calendar
} from 'lucide-react';

interface MaintenancePlan {
  id: string;
  month: number;
  year: number;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELED';
  periodicidad: string;
  equipments: {
    equipo: string;
    servicio: string;
    ubicacion: string;
  };
}

const MaintenanceKPIs = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(1); // Empezar en Enero 2026
  const [selectedYear, setSelectedYear] = useState(2026);
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select(`
          id, month, year, status, periodicidad,
          equipments ( equipo, servicio, ubicacion )
        `)
        .eq('year', selectedYear);

      if (error) throw error;
      setPlans(data as any || []);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  // Filtrar datos según mes seleccionado y término de búsqueda
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const isMonth = p.month === selectedMonth;
      const matchesSearch = !searchTerm || 
        p.equipments?.equipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.equipments?.servicio?.toLowerCase().includes(searchTerm.toLowerCase());
      return isMonth && matchesSearch;
    });
  }, [plans, selectedMonth, searchTerm]);

  // Cálculos de KPIs
  const stats = useMemo(() => {
    const total = filteredPlans.length;
    const completed = filteredPlans.filter(p => p.status === 'COMPLETED').length;
    const pending = filteredPlans.filter(p => p.status === 'PENDING').length;
    const overdue = filteredPlans.filter(p => p.status === 'OVERDUE').length;
    
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, pending, overdue, percentage };
  }, [filteredPlans]);

  // Agrupación por servicio para tabla comparativa
  const serviceStats = useMemo(() => {
    const services: Record<string, { total: number, done: number }> = {};
    filteredPlans.forEach(p => {
      const srv = p.equipments?.servicio || 'SIN SERVICIO';
      if (!services[srv]) services[srv] = { total: 0, done: 0 };
      services[srv].total++;
      if (p.status === 'COMPLETED') services[srv].done++;
    });
    return Object.entries(services).sort((a,b) => b[1].total - a[1].total);
  }, [filteredPlans]);

  return (
    <div className="p-4 lg:p-10 max-h-screen overflow-y-auto w-full custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Indicadores de Gestión</h1>
            <p className="text-white/50 text-sm mt-1">Cumplimiento de Mantenimiento Preventivo {selectedYear}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-white/70"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-w-[120px]"
              >
                <option value={2025} className="bg-gray-900">2025</option>
                <option value={2026} className="bg-gray-900">2026</option>
              </select>
            </div>
            
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-w-[200px]"
              >
              {months.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-gray-900">{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard 
          icon={Target} 
          label="Cumplimiento Global" 
          value={`${stats.percentage.toFixed(1)}%`}
          color="cyan"
          trend={`${stats.completed}/${stats.total} Equipos`}
        />
        <KPICard 
          icon={CheckCircle2} 
          label="Ejecutados" 
          value={stats.completed}
          color="emerald"
        />
        <KPICard 
          icon={Clock} 
          label="Pendientes hoy" 
          value={stats.pending}
          color="amber"
        />
        <KPICard 
          icon={AlertCircle} 
          label="En Mora" 
          value={stats.overdue}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart Placeholder / Detail */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Estado de Programación por Servicio
            </h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Buscar servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                <p className="text-white/40 animate-pulse">Analizando cronograma...</p>
              </div>
            ) : serviceStats.length > 0 ? (
              serviceStats.slice(0, 8).map(([name, data]) => {
                const perc = (data.done / data.total) * 100;
                return (
                  <div key={name} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-white/80 group-hover:text-cyan-300 transition-colors uppercase tracking-wider">{name}</span>
                      <span className="text-xs text-white/40">{data.done} de {data.total}</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(34,211,238,0.2)] ${
                          perc === 100 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 
                          perc > 50 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 
                          'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-white/30 border-2 border-dashed border-white/5 rounded-2xl">
                No hay mantenimientos programados para este mes
              </div>
            )}
          </div>
        </div>

        {/* Legend / Info Card */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-blue-900/20 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6">Información del Periodo</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Los indicadores muestran el grado de cumplimiento de los mantenimientos preventivos asignados según el cronograma institucional **GRF3MAN-FR57**. 
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Cumplimiento total en quirófanos</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Equipos en espera de técnicos externos</span>
              </li>
            </ul>
          </div>

          <div className="mt-10 p-5 bg-black/30 rounded-2xl border border-white/10">
            <div className="text-xs text-white/40 uppercase mb-2">Meta Institucional</div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">95.0%</div>
            <div className="mt-3 w-full h-1 bg-white/10 rounded-full">
              <div className="w-[95%] h-full bg-amber-500/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, color, trend }: any) => {
  const colors: any = {
    cyan: 'from-cyan-500/20 to-blue-500/5 text-cyan-400 border-cyan-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/20'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group`}>
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24" />
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">{label}</span>
      </div>
      
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      {trend && <div className="text-xs text-white/40 font-medium">{trend}</div>}
    </div>
  );
};

const Loader2 = ({ className }: any) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default MaintenanceKPIs;
