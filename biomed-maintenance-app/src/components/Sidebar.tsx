import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  ClipboardList, 
  Wrench, 
  Settings, 
  LogOut,
  Hospital
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();

  return (
    <aside className="w-72 bg-white/[0.03] backdrop-blur-[24px] border-r border-white/10 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-4 border-b border-white/10">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-white/20">
          <Hospital className="w-6 h-6 text-white drop-shadow-md" />
        </div>
        <div>
           {/* Glowing Golden Yellow Title */}
          <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 text-xl tracking-wide drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]">
            BiomedMain
          </h1>
          <p className="text-xs text-white/60 font-light tracking-widest uppercase mt-1">Portal HSJ</p>
        </div>
      </div>

      <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-4">Principal</p>
        
        <SidebarItem to="/" icon={<Home size={22} />} label="Dashboard" iconColor="cyan" />
        <SidebarItem to="/inventory" icon={<Activity size={22} />} label="Inventario" iconColor="orange" />
        <SidebarItem to="/preventive" icon={<ClipboardList size={22} />} label="Preventivos" iconColor="green" />
        <SidebarItem to="/corrective" icon={<Wrench size={22} />} label="Correctivos" iconColor="purple" />
        
        <div className="mt-10 mb-4">
          <p className="px-3 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-2">Sistema</p>
        </div>
        
        <SidebarItem to="/settings" icon={<Settings size={22} />} label="Configuración" iconColor="slate" />
      </nav>

      <div className="p-6 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all duration-300 group border border-transparent hover:border-rose-500/30"
        >
          <LogOut size={20} className="group-hover:text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0)] group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] transition-all" />
          <span className="font-light tracking-wide text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

interface ItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  iconColor: 'cyan' | 'orange' | 'green' | 'purple' | 'slate';
}

const SidebarItem = ({ to, icon, label, iconColor }: ItemProps) => {
  const getIconColor = () => {
    switch(iconColor) {
      case 'cyan': return 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]';
      case 'orange': return 'text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]';
      case 'green': return 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]';
      case 'purple': return 'text-violet-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.7)]';
      default: return 'text-slate-300';
    }
  };

  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        isActive 
          ? 'bg-white/10 border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.2)]' 
          : 'hover:bg-white/[0.05] border border-transparent hover:border-white/10'
      }`}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
          )}
          
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-r-full shadow-[0_0_15px_rgba(253,224,71,0.8)]"></span>
          )}
          
          <span className={`transition-all duration-300 ${isActive ? getIconColor() : 'text-white/50 group-hover:text-white/90 group-hover:scale-110'}`}>
            {icon}
          </span>
          
          <span className={`font-light tracking-wide text-sm ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;
