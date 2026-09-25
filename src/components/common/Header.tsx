import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Dumbbell, Database, User, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    activeCycle,
    setIsSupabaseModalOpen,
    setIsAuthModalOpen,
    isSupabaseConnected,
    currentTab,
    setCurrentTab,
  } = useWorkout();

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-white">CICLOTREINO</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
              {activeCycle.name}
            </span>
          </div>
        </button>

        {/* Action Badges */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton />

          {/* Calendar Quick Toggle */}
          <button
            onClick={() => setCurrentTab(currentTab === 'calendario' ? 'historico' : 'calendario')}
            className={`p-2 rounded-xl transition ${
              currentTab === 'calendario'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Calendário de Treinos"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          {/* Supabase Connection Status Badge */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
              isSupabaseConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Configurar Supabase & SQL"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSupabaseConnected ? 'Supabase' : 'Offline'}</span>
            {isSupabaseConnected && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
          </button>

          {/* Profile / Auth Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition"
            title="Conta / Autenticação"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
