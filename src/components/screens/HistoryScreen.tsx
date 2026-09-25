import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  Dumbbell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CalendarScreen } from './CalendarScreen';

export const HistoryScreen: React.FC = () => {
  const { sessions, currentTab, setCurrentTab } = useWorkout();
  const [activeView, setActiveView] = useState<'lista' | 'calendario'>('lista');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // If currentTab was directly set to 'calendario', show calendar
  React.useEffect(() => {
    if (currentTab === 'calendario') {
      setActiveView('calendario');
    }
  }, [currentTab]);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Top Segmented Controls: Lista vs Calendário */}
      <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex items-center">
        <button
          onClick={() => {
            setActiveView('lista');
            setCurrentTab('historico');
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            activeView === 'lista'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Linha do Tempo</span>
        </button>

        <button
          onClick={() => {
            setActiveView('calendario');
            setCurrentTab('calendario');
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            activeView === 'calendario'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendário Mensal</span>
        </button>
      </div>

      {activeView === 'calendario' ? (
        <CalendarScreen />
      ) : (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800/80 p-6">
              <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhum treino no histórico</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Assim que você concluir seus primeiros treinos da sequência, o histórico e calendário serão preenchidos.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isExpanded = expandedSessionId === sess.id;
              return (
                <div
                  key={sess.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all shadow-md"
                >
                  {/* Card Header (clickable to expand) */}
                  <button
                    onClick={() => toggleExpand(sess.id)}
                    className="w-full p-4.5 text-left flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {formatDate(sess.startedAt)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {sess.cycleName}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white mt-1.5">
                        {sess.workoutName}
                      </h3>

                      {/* Summary Metrics */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {formatDuration(sess.durationSeconds)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          {sess.totalSets} séries
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Dumbbell className="w-3.5 h-3.5 text-slate-500" />
                          {sess.totalVolumeKg} kg
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Detail (Exercícios, Cargas e Séries) */}
                  {isExpanded && (
                    <div className="px-4.5 pb-4.5 pt-2 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                      {sess.exercises.map((ex, exIdx) => {
                        const completedSets = ex.sets.filter((s) => s.completed);
                        const repsSummary = completedSets.map((s) => `${s.repsPerformed}r`).join(' • ');

                        return (
                          <div
                            key={ex.id || exIdx}
                            className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-slate-200">{ex.exerciseName}</h4>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                {ex.lastLoadKg || (completedSets[0]?.loadKg ?? 0)} kg
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span>{completedSets.length} séries concluídas:</span>
                              <span className="text-slate-300 font-semibold">{repsSummary || 'Nenhuma'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
