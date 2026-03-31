import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { MobileDrawerOverlay } from './components/MobileDrawerOverlay';
import Dashboard from './components/Dashboard';
import Inventory from './pages/Inventory';
import Preventive from './pages/Preventive';
import Corrective from './pages/Corrective';
import SurgeryRounds from './pages/SurgeryRounds';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoized callbacks
  const toggleMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Handle window resize to close drawer on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-[#030712] text-white relative">
      {/* Background Ambient Glows - Intensified for Vercel */}
      <div className="absolute inset-0 bg-[#030712] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none"></div>
      
      {/* Hamburger button - visible only on mobile */}
      <button
        onClick={toggleMenu}
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg transition-colors ${
          isMobileMenuOpen ? 'bg-orange-500/20' : 'hover:bg-gray-800'
        }`}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <title>Menu</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      <MobileDrawerOverlay
        isOpen={isMobileMenuOpen}
        onClose={closeMenu}
      >
        <Sidebar onItemClick={closeMenu} />
      </MobileDrawerOverlay>
      
      <div className="flex-1 h-screen overflow-hidden z-10 flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/preventive" element={<Preventive />} />
          <Route path="/corrective" element={<Corrective />} />
          <Route path="/surgery-rounds" element={<SurgeryRounds />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
