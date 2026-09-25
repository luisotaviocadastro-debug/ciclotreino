import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Exercise } from '../../types';
import { X, TrendingUp, Trophy, Calendar, Sparkles } from 'lucide-react';

interface Props {
  exercise: Exercise;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<Props> = ({ exercise, onClose }) => {
  const { progressions } = useWorkout();

  // Find all progressions for this specific exercise (isolated history!)
  const exerciseHistory = progressions
    .filter((p) => p.exerciseId === exercise.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const hasHistory = exerciseHistory.length > 0;
  const latestRecord = hasHistory ? exerciseHistory[0] : null;

  // Compute best load achieved
  const bestLoad = hasHistory
    ? Math.max(...exerciseHistory.map((p) => p.appliedLoadKg || p.loadKg))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Muscle group badge */}
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 w-fit">
          {exercise.muscleGroup}
        </span>

        <h2 className="text-xl font-black text-white mt-1.5 leading-snug">
          {exercise.name}
        </h2>
        {exercise.notes && (
          <p className="text-xs text-slate-400 mt-1 italic">{exercise.notes}</p>
        )}

        {/* Stats Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Última Carga</span>
            <span className="font-mono text-xl font-black text-white">
              {latestRecord ? `${latestRecord.loadKg} kg` : 'Sem registros'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              Melhor Carga
            </span>
            <span className="font-mono text-xl font-black text-amber-400">
              {bestLoad !== null ? `${bestLoad} kg` : '-'}
            </span>
          </div>
        </div>

        {/* Suggestion Card */}
        {latestRecord && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
              <Sparkles className="w-3 h-3" />
              Próxima Sugestão Baseada no Histórico
            </div>
            <div className="text-xs font-bold text-white">
              {latestRecord.suggestedLoadKg} kg • {latestRecord.suggestedReps} reps
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {latestRecord.metTarget
                ? 'Meta anterior batida! Sugestão de carga progressiva ativa.'
                : 'Meta anterior não batida. Carga sugerida mantida para consolidação.'}
            </p>
          </div>
        )}

        {/* Full Progression Timeline */}
        <div className="flex-1 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Histórico de Evolução
          </h4>

          {!hasHistory ? (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-2xl p-4 border border-slate-800/60">
              <p className="font-semibold text-slate-400">Primeiro registro pendente</p>
              <p className="text-[11px] mt-1">
                Este exercício ainda não foi executado. O sistema não inventa histórico fictício e começará a sugerir progressões após sua primeira sessão real.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {exerciseHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date.split('-').reverse().join('/')}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-300">
                      Reps: {rec.repsList.join(' / ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-black text-emerald-400 block">
                      {rec.appliedLoadKg || rec.loadKg} kg
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {rec.metTarget ? 'Meta batida' : 'Em consolidação'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
