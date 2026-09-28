import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  PlusCircle,
  Trash2,
} from 'lucide-react';

export const ActiveWorkoutScreen: React.FC = () => {
  const {
    activeSession,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    recordSet,
    quickUpdateSet,
    addSetToCurrentExercise,
    removeSetFromCurrentExercise,
    finishExercise,
    finishWorkout,
    cancelWorkout,
    setIsSwapModalOpen,
    nextWorkoutInfo,
    startWorkout,
  } = useWorkout();

  // Selected set index within the current exercise for stepper adjustment
  const [selectedSetIdx, setSelectedSetIdx] = useState<number>(0);

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Nenhum treino em andamento</h2>
        <p className="text-xs text-slate-400 max-w-xs">
          Seu próximo treino programado é o{' '}
          <strong className="text-white">{nextWorkoutInfo.nextWorkout.name}</strong>.
        </p>
        <button
          onClick={() => startWorkout()}
          className="mt-2 w-full max-w-xs py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 active:scale-98 transition"
        >
          INICIAR AGORA
        </button>
      </div>
    );
  }

  const currentExercise = activeSession.exercises[currentExerciseIndex] || activeSession.exercises[0];
  const sets = currentExercise.sets;

  // Active target set: first incomplete set, or the user's explicitly selected set
  const firstUncompletedIdx = sets.findIndex((s) => !s.completed);
  const activeSetIndex = selectedSetIdx < sets.length ? selectedSetIdx : (firstUncompletedIdx >= 0 ? firstUncompletedIdx : 0);
  const activeSet = sets[activeSetIndex];

  // Handlers for steppers
  const handleAdjustLoad = (delta: number) => {
    if (!activeSet) return;
    const newLoad = Math.max(0, activeSet.loadKg + delta);
    quickUpdateSet(currentExerciseIndex, activeSetIndex, newLoad, activeSet.repsPerformed);
  };

  const handleAdjustReps = (delta: number) => {
    if (!activeSet) return;
    const newReps = Math.max(1, activeSet.repsPerformed + delta);
    quickUpdateSet(currentExerciseIndex, activeSetIndex, activeSet.loadKg, newReps);
  };

  const handleTapCompleteActiveSet = () => {
    if (!activeSet) return;
    recordSet(currentExerciseIndex, activeSetIndex, activeSet.loadKg, activeSet.repsPerformed);
    // Advance selected set to next incomplete one
    if (activeSetIndex + 1 < sets.length) {
      setSelectedSetIdx(activeSetIndex + 1);
    }
  };

  const allSetsCompleted = sets.every((s) => s.completed);
  const isLastExercise = currentExerciseIndex === activeSession.exercises.length - 1;

  return (
    <div className="space-y-4 pb-32 pt-1">
      {/* Top Session Breadcrumb & Navigation */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
            {activeSession.workoutName}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Exercício {currentExerciseIndex + 1} de {activeSession.exercises.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex(currentExerciseIndex - 1);
                setSelectedSetIdx(0);
              }
            }}
            disabled={currentExerciseIndex === 0}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
            title="Exercício anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (currentExerciseIndex < activeSession.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setSelectedSetIdx(0);
              }
            }}
            disabled={isLastExercise}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
            title="Próximo exercício"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
        {/* Exercise Header & Swap Button */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {currentExercise.muscleGroup}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-snug">
              {currentExercise.exerciseName}
            </h1>
          </div>

          <button
            onClick={() => setIsSwapModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold border border-slate-700/60 active:scale-95 transition shrink-0"
            title="Substituir por outro exercício"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Trocar</span>
          </button>
        </div>

        {/* Target & Last Load Info */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <div>
            <span className="text-slate-500 block text-[10px]">Meta planejada:</span>
            <span className="font-bold text-slate-200">
              {currentExercise.targetSets} séries × {currentExercise.targetReps} reps
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">Carga anterior:</span>
            <span className="font-mono font-bold text-emerald-400">
              {currentExercise.lastLoadKg !== undefined ? `${currentExercise.lastLoadKg} kg` : '1º registro'}
            </span>
          </div>
        </div>

        {/* Sets List Table (Fast tap check or edit) */}
        <div className="space-y-2 mb-5">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
            <div className="col-span-2">Série</div>
            <div className="col-span-4 text-center">Carga (kg)</div>
            <div className="col-span-4 text-center">Reps</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {sets.map((set, idx) => {
            const isSelected = idx === activeSetIndex;
            return (
              <div
                key={set.id}
                onClick={() => setSelectedSetIdx(idx)}
                className={`grid grid-cols-12 items-center p-3 rounded-2xl transition cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                    : set.completed
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-200'
                }`}
              >
                {/* Set Number */}
                <div className="col-span-2 flex items-center gap-1.5 font-mono text-xs font-black">
                  <span className={isSelected ? 'text-emerald-400' : 'text-slate-400'}>
                    #{set.setNumber}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </div>

                {/* Load */}
                <div className="col-span-4 text-center font-mono text-sm font-bold text-white">
                  {set.loadKg} <span className="text-[10px] font-normal text-slate-500">kg</span>
                </div>

                {/* Reps */}
                <div className="col-span-4 text-center font-mono text-sm font-bold text-white">
                  {set.repsPerformed} <span className="text-[10px] font-normal text-slate-500">reps</span>
                </div>

                {/* Complete Button Icon & Delete */}
                <div className="col-span-2 flex items-center justify-end gap-1.5">
                  {sets.length > 1 && !set.completed && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSetFromCurrentExercise(currentExerciseIndex, idx);
                        if (selectedSetIdx >= sets.length - 1) {
                          setSelectedSetIdx(Math.max(0, sets.length - 2));
                        }
                      }}
                      className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Excluir esta série"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      recordSet(currentExerciseIndex, idx, set.loadKg, set.repsPerformed);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90 ${
                      set.completed
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {set.completed ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-mono">{idx + 1}</span>}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Dynamic "+ Série" button */}
          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                addSetToCurrentExercise(currentExerciseIndex);
                setSelectedSetIdx(sets.length);
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Adicionar Série #{sets.length + 1}</span>
            </button>
          </div>
        </div>

        {/* Quick Stepper Controllers for Active Set (One-handed ergonomics) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>Ajustar Série #{activeSetIndex + 1}</span>
            </span>
            <span className="text-[11px] text-slate-400">Toque nos botões para ajustar</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Load Stepper */}
            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Carga
              </span>
              <div className="font-mono text-2xl font-black text-white mb-2">
                {activeSet?.loadKg || 0} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="flex items-center gap-1.5 w-full">
                <button
                  onClick={() => handleAdjustLoad(-2)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  -2
                </button>
                <button
                  onClick={() => handleAdjustLoad(-0.5)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustLoad(0.5)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustLoad(2)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  +2
                </button>
              </div>
            </div>

            {/* Reps Stepper */}
            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Repetições
              </span>
              <div className="font-mono text-2xl font-black text-white mb-2">
                {activeSet?.repsPerformed || 0} <span className="text-xs font-normal text-slate-400">reps</span>
              </div>
              <div className="flex items-center gap-1.5 w-full">
                <button
                  onClick={() => handleAdjustReps(-2)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  -2
                </button>
                <button
                  onClick={() => handleAdjustReps(-1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustReps(1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleAdjustReps(2)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-mono font-bold text-xs text-slate-200 active:scale-95 transition"
                >
                  +2
                </button>
              </div>
            </div>
          </div>

          {/* Big Tap "REGISTRAR SÉRIE" Button */}
          <button
            onClick={handleTapCompleteActiveSet}
            className={`w-full py-4 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl active:scale-98 transition ${
              activeSet?.completed
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {activeSet?.completed
                ? `DESMARCAR SÉRIE #${activeSetIndex + 1}`
                : `REGISTRAR SÉRIE #${activeSetIndex + 1}`}
            </span>
          </button>
        </div>

        {/* Complete Exercise Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => finishExercise(currentExerciseIndex)}
            className="w-full py-3.5 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>CONCLUIR EXERCÍCIO & VER PROGRESSÃO</span>
          </button>
        </div>
      </div>

      {/* Finish Workout or Cancel Bar */}
      <div className="pt-2 flex items-center gap-3">
        <button
          onClick={cancelWorkout}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 text-xs font-bold transition flex items-center gap-1.5"
          title="Cancelar treino"
        >
          <XCircle className="w-4 h-4" />
          <span>Cancelar</span>
        </button>

        <button
          onClick={finishWorkout}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <CheckCircle2 className="w-5 h-5 fill-current" />
          <span>FINALIZAR TREINO COMPLETO</span>
        </button>
      </div>
    </div>
  );
};
