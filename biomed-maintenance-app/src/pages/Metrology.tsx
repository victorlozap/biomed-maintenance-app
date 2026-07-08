import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CalibrationRecord } from '../types/metrology';
import CalibrationTable from '../components/metrology/CalibrationTable';
import EditCalibrationModal from '../components/metrology/EditCalibrationModal';
import { Scale, Search, Filter, Download } from 'lucide-react';

const Metrology = () => {
  const [records, setRecords] = useState<CalibrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('TODOS');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CalibrationRecord | null>(null);
  
  // Derivados
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    fetchCalibrations();
  }, []);

  const fetchCalibrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calibrations')
        .select('*')
        .order('fecha_proxima_calibracion', { ascending: true });

      if (error) throw error;
      
      setRecords(data || []);
      
      // Extraer servicios únicos
      const uniqueServices = Array.from(new Set((data || []).map(r => r.servicio).filter(Boolean)));
      setServices(uniqueServices.sort());
      
    } catch (err: any) {
      console.error('Error fetching calibrations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.equipo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.serie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.codigo_equipo || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesService = selectedService === 'TODOS' || record.servicio === selectedService;
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.3)] tracking-wide">
            Metrología y Calibraciones
          </h2>
          <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide flex items-center gap-2">
            <Scale size={16} className="text-slate-400" /> Control metrológico HUSJ
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium transition-all shadow-lg backdrop-blur-md">
            <Download size={18} />
            Exportar Reporte
          </button>
        </div>
      </header>

      {/* Controles de filtro */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-8 lg:col-span-6 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Buscar por equipo, serie o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-transparent transition-all shadow-inner"
          />
        </div>
        
        <div className="md:col-span-4 lg:col-span-3 relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-transparent transition-all shadow-inner cursor-pointer"
          >
            <option value="TODOS">Todos los servicios</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <CalibrationTable 
        data={filteredRecords} 
        loading={loading} 
        onEdit={(record) => {
          setSelectedRecord(record);
          setIsModalOpen(true);
        }}
      />

      {/* Modal de edición */}
      <EditCalibrationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onSuccess={() => {
          fetchCalibrations();
        }}
      />
    </div>
  );
};

export default Metrology;
