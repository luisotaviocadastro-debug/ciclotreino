import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Home, Play, History, Dumbbell, Layers, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, activeSession } = useWorkout();

  const navItems = [
    { id: 'home' as const, label: 'Início', icon: Home },
    { id: 'treino' as const, label: activeSession ? 'Treinando' : 'Treino', icon: Play, isCenter: true },
    { id: 'historico' as const, label: 'Histórico', icon: History },
    { id: 'exercicios' as const, label: 'Exercícios', icon: Dumbbell },
    { id: 'ciclos' as const, label: 'Ciclos', icon: Layers },
    { id: 'perfil' as const, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab('treino')}
                className="relative -top-3 group flex flex-col items-center"
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    activeSession
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/40 animate-pulse'
                      : 'bg-emerald-500 text-slate-950 shadow-emerald-500/25'
                  }`}
                >
                  <Icon className="w-6 h-6 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
