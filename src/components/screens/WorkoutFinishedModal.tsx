import React, { useEffect } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import confetti from 'canvas-confetti';
import { Trophy, Clock, CheckCircle2, Dumbbell, ArrowRight, Sparkles } from 'lucide-react';

export const WorkoutFinishedModal: React.FC = () => {
  const {
    finishedWorkoutSummary,
    closeFinishedWorkoutModal,
    nextWorkoutInfo,
  } = useWorkout();

  useEffect(() => {
    if (finishedWorkoutSummary) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#06b6d4', '#e2e8f0'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [finishedWorkoutSummary]);

  if (!finishedWorkoutSummary) return null;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
          TREINO CONCLUÍDO
        </span>
        <h2 className="text-2xl font-black text-white mt-1">
          {finishedWorkoutSummary.workoutName}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Dados salvos e histórico atualizado com sucesso.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block">Duração</span>
            <span className="font-mono font-bold text-sm text-white">
              {formatDuration(finishedWorkoutSummary.durationSeconds)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block">Séries</span>
            <span className="font-mono font-bold text-sm text-white">
              {finishedWorkoutSummary.totalSets}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <Dumbbell className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block">Volume Total</span>
            <span className="font-mono font-bold text-sm text-white">
              {finishedWorkoutSummary.totalVolumeKg} <span className="text-[10px] font-normal">kg</span>
            </span>
          </div>
        </div>

        {/* Next Workout Teaser (Key requirement from AppMusculacao.txt) */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left mb-6">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Sparkles className="w-3 h-3" />
            Próximo Treino da Sequência
          </div>
          <div className="text-sm font-black text-white">
            {nextWorkoutInfo.nextWorkout.name}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Posição no ciclo: {nextWorkoutInfo.positionInCycle} • Pronto para quando você voltar!
          </span>
        </div>

        {/* Finish / Return to Home */}
        <button
          onClick={closeFinishedWorkoutModal}
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <span>FINALIZAR E VOLTAR AO INÍCIO</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
