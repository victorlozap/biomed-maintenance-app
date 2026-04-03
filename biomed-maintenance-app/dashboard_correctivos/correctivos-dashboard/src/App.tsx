import React, { useEffect, useState, useMemo } from "react";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Wrench, 
  ArrowUpRight,
  Stethoscope,
  Building2,
  Calendar,
  Lock,
  Unlock
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// 1. Tipos de datos sincronizados con el Backend
type CorrectivoApi = {
  id: number;
  fechaCreacion: string | null;
  equipo: string | null;
  servicio: string | null;
  ubicacion: string | null;
  causa: string | null;
  estado: string | null;
  estadoNorm: string;
  tecnico: string | null;
  capacidadLt3Dias: number | null;
  estadoEquipo: string | null;
};

type Kpis = {
  total: number;
  cerrados: number;
  abiertos: number;
  slaPct: number | null;
  cumplimiento: number;
  topEquipo: { name: string | null; count: number };
};

const COLORS = ['#22D3EE', '#8B5CF6', '#14B8A6', '#F7C948', '#F43F5E', '#FB923C'];

export default function App() {
  const [data, setData] = useState<CorrectivoApi[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");

  useEffect(() => {
    // Carga paralela de datos y KPIs
    const fetchData = async () => {
      try {
        const [dataRes, kpiRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/correctivos?periodo=2026-03"),
          fetch("http://127.0.0.1:8000/api/kpis?periodo=2026-03")
        ]);
        
        const jsonData = await dataRes.json();
        const jsonKpis = await kpiRes.json();
        
        if (Array.isArray(jsonData)) {
          setData(jsonData);
        }
        if (jsonKpis && !jsonKpis.status) {
          setKpis(jsonKpis);
        }
      } catch (error) {
        console.error("Error conectando con el backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado reactivo en el frontend
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        (item.equipo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (item.servicio?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm);
        
      const matchesEstado = filterEstado === "TODOS" || item.estadoNorm === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [data, searchTerm, filterEstado]);

  // Agregaciones para los gráficos basadas en los datos filtrados
  const topEquiposData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      if (item.equipo) counts[item.equipo] = (counts[item.equipo] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const causasData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      if (item.causa) counts[item.causa] = (counts[item.causa] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cinematic flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-gold animate-spin" />
          <p className="text-gold-glow font-medium">Sincronizando con Excel Marzo 2026...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinematic text-white/90 pb-12">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/20 border border-gold/40 rounded-xl shadow-glow-gold">
              <Wrench className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-gold-glow">BIOMED HUSJ</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">API Centralizada . Excel Backend</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-[10px] text-white/30 uppercase tracking-tighter">SLA Oportunidad</span>
              <span className="text-lg font-black text-neon-teal">{kpis?.slaPct ?? 0}%</span>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-white/40 font-bold">Marzo 2026</span>
              <span className="text-[10px] flex items-center gap-1 text-gold/60">
                <Calendar className="w-3 h-3" /> Tabla: Marzo_2026
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total Correctivos" 
            value={kpis?.total ?? 0} 
            icon={<Activity className="w-5 h-5 text-gold" />}
            trend="100% registros"
            color="border-white/10"
          />
          <KpiCard 
            title="Cerrados" 
            value={kpis?.cerrados ?? 0} 
            icon={<CheckCircle2 className="w-5 h-5 text-neon-teal" />}
            trend="Finalizados"
            color="border-neon-teal/20"
          />
          <KpiCard 
            title="Abiertos" 
            value={kpis?.abiertos ?? 0} 
            icon={<Clock className="w-5 h-5 text-neon-violet" />}
            trend="En gestión"
            color="border-neon-violet/20"
          />
          <KpiCard 
            title="% Cumplimiento" 
            value={`${kpis?.cumplimiento ?? 0}%`} 
            icon={<CheckCircle2 className="w-5 h-5 text-neon-cyan" />}
            trend="Cerrados / Total"
            color="border-neon-cyan/20"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10">
            <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold" /> Incidencia por Equipo
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEquiposData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    style={{ fontSize: '10px', fill: 'rgba(255,255,255,0.5)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#F7C948' }}
                  />
                  <Bar dataKey="value" fill="#F7C948" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10">
            <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
              <Filter className="w-5 h-5 text-neon-cyan" /> Causas Principales
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={causasData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    style={{ fontSize: '10px', fill: 'rgba(255,255,255,0.5)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#22D3EE' }}
                  />
                  <Bar dataKey="value" fill="#22D3EE" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold" /> Detalle Sincronizado
            </h3>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Buscar reporte, equipo..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="CERRADO">Cerrados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="TRABAJANDO">En Proceso</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/30 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Soporte</th>
                  <th className="px-6 py-4">Equipo</th>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Estado Equipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.slice(0, 50).map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-gold/80">#{item.id}</td>
                    <td className="px-6 py-4 font-bold text-white/90">{item.equipo}</td>
                    <td className="px-6 py-4 text-white/50">{item.servicio}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                        item.estadoNorm === "CERRADO" 
                          ? "bg-neon-teal/10 text-neon-teal border-neon-teal/20" 
                          : item.estadoNorm === "TRABAJANDO"
                          ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20"
                          : "bg-neon-violet/10 text-neon-violet border-neon-violet/20"
                      }`}>
                        {item.estadoNorm}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-white/60">{item.estadoEquipo || "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, icon, trend, color }: { title: string, value: string | number, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <div className={`glass-card p-6 rounded-3xl border ${color} relative overflow-hidden group`}>
      <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-3xl font-black text-white mb-2">{value}</h2>
      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
        <ArrowUpRight className="w-3 h-3" /> {trend}
      </div>
    </div>
  );
}
