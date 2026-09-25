import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Check, Sparkles, TrendingUp, X } from 'lucide-react';

export const ExerciseFinishedModal: React.FC = () => {
  const {
    finishedExerciseResult,
    closeFinishedExerciseModal,
    applyProgressionChoice,
    currentExerciseIndex,
  } = useWorkout();

  const [selectedLoad, setSelectedLoad] = useState<number | null>(null);
  const [selectedReps, setSelectedReps] = useState<number | null>(null);
  const [customChoiceType, setCustomChoiceType] = useState<'carga' | 'repeticoes' | 'manter'>('carga');
  const [appliedPercent, setAppliedPercent] = useState<number | undefined>(10);

  if (!finishedExerciseResult) return null;

  const { exercise, progression } = finishedExerciseResult;
  const { options, isTargetMet } = progression;

  const effectiveLoad = selectedLoad !== null ? selectedLoad : progression.suggestedLoadKg;
  const effectiveReps = selectedReps !== null ? selectedReps : progression.suggestedReps;

  const handleSelectOption = (
    load: number,
    reps: number,
    type: 'carga' | 'repeticoes' | 'manter',
    percent?: number
  ) => {
    setSelectedLoad(load);
    setSelectedReps(reps);
    setCustomChoiceType(type);
    setAppliedPercent(percent);
  };

  const handleConfirm = () => {
    applyProgressionChoice(
      currentExerciseIndex,
      effectiveLoad,
      effectiveReps,
      customChoiceType,
      appliedPercent
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
        <button
          onClick={closeFinishedExerciseModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          EXERCÍCIO CONCLUÍDO
        </div>

        {/* Exercise Title */}
        <h3 className="text-xl font-black text-white">{exercise.exerciseName}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Meta planejada: {exercise.targetSets} × {exercise.targetReps} reps
        </p>

        {/* Performance summary card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Carga executada:</span>
            <span className="font-mono font-bold text-white text-sm">
              {progression.lastLoadKg} kg
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Reps por série:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {progression.lastRepsSummary}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <span className="font-bold text-white block mb-0.5">{progression.summaryTitle}</span>
            <p className="text-slate-400 leading-relaxed">{progression.summaryDescription}</p>
          </div>
        </div>

        {/* Next workout suggestion section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Próxima Vez (Sugestão Editável)
            </span>
            <span className="text-xs font-mono font-black text-emerald-400">
              {effectiveLoad} kg • {effectiveReps} reps
            </span>
          </div>

          {/* Quick Choice Chips */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSelectOption(options.plus5, exercise.targetReps, 'carga', 5)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                effectiveLoad === options.plus5 && customChoiceType === 'carga'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              +5% ({options.plus5}kg)
            </button>

            <button
              onClick={() => handleSelectOption(options.plus10, exercise.targetReps, 'carga', 10)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                effectiveLoad === options.plus10 && customChoiceType === 'carga'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              +10% ({options.plus10}kg)
            </button>

            <button
              onClick={() => handleSelectOption(options.plus15, exercise.targetReps, 'carga', 15)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                effectiveLoad === options.plus15 && customChoiceType === 'carga'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              +15% ({options.plus15}kg)
            </button>

            <button
              onClick={() => handleSelectOption(options.plus20, exercise.targetReps, 'carga', 20)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                effectiveLoad === options.plus20 && customChoiceType === 'carga'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              +20% ({options.plus20}kg)
            </button>

            <button
              onClick={() => handleSelectOption(progression.lastLoadKg, options.plusOneRep, 'repeticoes')}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                customChoiceType === 'repeticoes'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              +1 Rep ({options.plusOneRep} reps)
            </button>

            <button
              onClick={() => handleSelectOption(options.keepLoad, exercise.targetReps, 'manter', 0)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                effectiveLoad === options.keepLoad && customChoiceType === 'manter'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              Manter ({options.keepLoad}kg)
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>CONFIRMAR & AVANÇAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
