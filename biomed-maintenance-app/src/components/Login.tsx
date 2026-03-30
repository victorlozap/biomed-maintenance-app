import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Shield, Activity, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error, data } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (isRegistering && data.user) {
      alert("✅ ¡Registro enviado! Por favor revisa tu correo electrónico para confirmar tu cuenta (o desactiva la confirmación en Supabase).");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030712] relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50 blur-[120px]"></div>
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glow behind logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-400/20 blur-[80px] -z-10 rounded-full"></div>
        
        <header className="text-center mb-10">
          <div className="inline-flex p-4 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-3xl border border-orange-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-6">
            <Activity className="text-orange-400 w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-[0_0_10px_rgba(253,224,71,0.2)] tracking-tight">
            BioMed HUSJ
          </h2>
          <p className="text-white/40 mt-3 font-light tracking-wide italic">"Estandarización y Precisión Biomédica"</p>
        </header>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-white/50 font-semibold ml-1">Email Institucional</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-400 transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all font-light"
                placeholder="ejemplo@husj.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-white/50 font-semibold ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-400 transition-colors" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all font-light"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl font-bold tracking-wide hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-orange-300/30 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Crear Cuenta' : 'Entrar al Sistema')}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-white/30 text-xs hover:text-orange-300 transition-colors tracking-wide underline decoration-white/10 underline-offset-4"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </footer>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/10 text-[10px] tracking-[0.2em] uppercase font-bold flex items-center gap-4">
        <Shield size={12} /> Acceso Restringido HUSJ 2025
      </div>
    </div>
  );
};

export default Login;
