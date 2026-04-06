import { useMemo } from 'react';
import { 
  Activity, HeartPulse, Beaker, ShieldCheck, Soup, 
  Baby, Scissors, Microscope, Zap, Thermometer, 
  Stethoscope, Syringe, Clipboard, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const SERVICE_ICONS: Record<string, any> = {
  'URGENCIAS': Activity,
  'UCI': HeartPulse,
  'UCI ADULTOS': HeartPulse,
  'UCI NEONATAL': Baby,
  'UCI PEDIATRICA': Baby,
  'LABORATORIO': Beaker,
  'LABORATORIO CLINICO': Beaker,
  'QUIRÓFANO': Scissors,
  'QUIRÓFANOS': Scissors,
  'ESTERILIZACIÓN': ShieldCheck,
  'SALA DE PARTOS': Baby,
  'HOSPITALIZACIÓN': Stethoscope,
  'IMÁGENES DIAGNÓSTICAS': Microscope,
  'RAYOS X': Zap,
  'FISIOTERAPIA': Activity,
  'ODONTOLOGÍA': Zap,
  'ALIMENTACIÓN': Soup,
  'NUTRICIÓN': Soup,
  'SISTEMAS': Settings,
  'FACTURACIÓN': Clipboard,
  'MANTENIMIENTO': Settings,
  'TERAPIA RESPIRATORIA': Thermometer,
  'BANCO DE SANGRE': Syringe
};

const getServiceIcon = (name: string) => {
  const upper = name.toUpperCase();
  for (const key in SERVICE_ICONS) {
    if (upper.includes(key)) return SERVICE_ICONS[key];
  }
  return Activity; // Default icon
};

interface ServiceGroup {
  name: string;
  count: number;
  equipments: any[];
}

interface ServiceConsolidatedProps {
  equipments: any[];
  onServiceClick: (service: ServiceGroup) => void;
}

const ServiceConsolidated = ({ equipments, onServiceClick }: ServiceConsolidatedProps) => {
  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceGroup> = {};
    
    equipments.forEach(eq => {
      const sName = eq.servicio || 'SIN ASIGNAR';
      if (!groups[sName]) {
        groups[sName] = { name: sName, count: 0, equipments: [] };
      }
      groups[sName].count++;
      groups[sName].equipments.push(eq);
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [equipments]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
      {groupedServices.map((service, index) => {
        const Icon = getServiceIcon(service.name);
        return (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onServiceClick(service)}
            className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 group-hover:text-orange-400 transition-all duration-500">
                  <Icon size={24} />
                </div>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white">
                  {service.count} Items
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-orange-200 transition-colors">
                {service.name}
              </h4>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                Consolidado HUSJ
              </p>
              
              <div className="mt-6 flex items-center gap-2 text-white/20 group-hover:text-orange-400/50 transition-colors">
                <span className="text-[9px] font-bold uppercase tracking-widest">Ver Equipamiento</span>
                <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-orange-400/20"></div>
                <Activity size={12} className="animate-pulse" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ServiceConsolidated;
