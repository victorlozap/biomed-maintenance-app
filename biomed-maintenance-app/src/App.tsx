import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './pages/Inventory';
import Preventive from './pages/Preventive';
import Corrective from './pages/Corrective';
import SurgeryRounds from './pages/SurgeryRounds';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen text-slate-100 font-sans font-light selection:bg-teal-500/30 overflow-hidden relative">
        {/* Deep, soft background gradient: royal blue, violet, teal */}
        <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_0%_0%,#1e1b4b_0%,#0f172a_40%,#022c22_85%,#042f2e_100%)]"></div>
        
        {/* Large glowing orbs for cinematic lighting */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/30 blur-[150px] rounded-full mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/30 blur-[150px] rounded-full mix-blend-screen"></div>
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="flex w-full z-10 relative">
          <Sidebar />
          
          {/* Main Content Router */}
          <div className="flex-1 h-screen overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/preventive" element={<Preventive />} />
              <Route path="/corrective" element={<Corrective />} />
              <Route path="/surgery" element={<SurgeryRounds />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
