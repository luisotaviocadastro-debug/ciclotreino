import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { RefreshCw, X, Search, Check } from 'lucide-react';
import { Exercise } from '../../types';

export const SwapExerciseModal: React.FC = () => {
  const {
    isSwapModalOpen,
    setIsSwapModalOpen,
    activeSession,
    currentExerciseIndex,
    swapExerciseInSession,
    exercises,
  } = useWorkout();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNewEx, setSelectedNewEx] = useState<Exercise | null>(null);

  if (!isSwapModalOpen || !activeSession) return null;

  const currentEx = activeSession.exercises[currentExerciseIndex];

  // Filter exercises
  const filtered = exercises.filter(
    (e) =>
      e.id !== currentEx.exerciseId &&
      (e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConfirmSwap = () => {
    if (!selectedNewEx) return;
    swapExerciseInSession(currentExerciseIndex, selectedNewEx);
    setSelectedNewEx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl relative flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Substituir Exercício
            </span>
            <h3 className="text-base font-black text-white">{currentEx.exerciseName}</h3>
          </div>
          <button
            onClick={() => {
              setIsSwapModalOpen(false);
              setSelectedNewEx(null);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 my-2">
          Selecione o novo exercício. O histórico do exercício anterior será preservado integralmente.
        </p>

        {/* Search */}
        <div className="relative my-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou grupo muscular..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 my-2 min-h-[160px]">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum exercício encontrado.
            </div>
          ) : (
            filtered.map((ex) => {
              const isSelected = selectedNewEx?.id === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedNewEx(ex)}
                  className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{ex.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={() => {
              setIsSwapModalOpen(false);
              setSelectedNewEx(null);
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmSwap}
            disabled={!selectedNewEx}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Substituir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
