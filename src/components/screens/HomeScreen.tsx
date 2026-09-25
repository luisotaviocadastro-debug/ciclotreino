import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Play, Flame, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    activeCycle,
    nextWorkoutInfo,
    activeSession,
    startWorkout,
    setCurrentTab,
    overrideNextWorkout,
  } = useWorkout();

  const { nextWorkout, lastSession, positionInCycle, daysSinceLastWorkout } = nextWorkoutInfo;
  const sortedWorkouts = [...activeCycle.workouts].sort((a, b) => a.orderIndex - b.orderIndex);

  const formatDaysAgo = (days: number | null) => {
    if (days === null) return 'Nenhum treino registrado ainda';
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    return `há ${days} dias`;
  };

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* Active Workout Banner (If in progress) */}
      {activeSession && (
        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-slate-900 border border-emerald-500/40 rounded-3xl p-4.5 shadow-xl shadow-emerald-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Treino em Andamento
              </span>
            </div>
            <span className="text-xs font-mono text-slate-300">
              {activeSession.totalSets} séries feitas
            </span>
          </div>

          <h2 className="text-lg font-black text-white mt-1.5">{activeSession.workoutName}</h2>

          <button
            onClick={() => setCurrentTab('treino')}
            className="mt-3.5 w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>CONTINUAR MEU TREINO</span>
          </button>
        </div>
      )}

      {/* Main Focus: "O que eu tenho que fazer agora?" */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Question */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            O que você faz agora
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
            Posição: {positionInCycle}
          </span>
        </div>

        {/* Target Workout Name */}
        <div className="my-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {nextWorkout.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {nextWorkout.exercises.length} exercícios programados • Sequência contínua
          </p>
        </div>

        {/* Big Action: "COMEÇAR TREINO" */}
        <button
          onClick={() => startWorkout(nextWorkout)}
          className="mt-5 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 active:scale-98 transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-slate-950/20 flex items-center justify-center">
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          </div>
          <span>COMEÇAR TREINO</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Last Workout Context (Independent of calendar days) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Último treino realizado:</span>
            <span className="font-semibold text-slate-300">
              {lastSession ? lastSession.workoutName : 'Primeiro treino do ciclo'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Intervalo:</span>
            <span className="font-bold text-emerald-400">
              {formatDaysAgo(daysSinceLastWorkout)}
            </span>
          </div>
        </div>
      </div>

      {/* Cyclical Sequence Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Sequência do Ciclo</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {activeCycle.workouts.length} treinos contínuos
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3.5">
          O treino avança sequencialmente, sem depender dos dias da semana.
        </p>

        {/* Sequence track */}
        <div className="grid grid-cols-2 gap-2">
          {sortedWorkouts.map((w, index) => {
            const isNext = w.id === nextWorkout.id;
            const isDoneRecently = lastSession?.workoutId === w.id;

            return (
              <button
                key={w.id}
                onClick={() => overrideNextWorkout(w.id)}
                className={`p-3 rounded-2xl text-left border transition relative overflow-hidden active:scale-98 ${
                  isNext
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {isNext && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" />
                    PRÓXIMO
                  </div>
                )}
                {isDoneRecently && !isNext && (
                  <div className="absolute top-2 right-2 text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}

                <span className="text-[11px] font-mono text-slate-500 block mb-0.5">
                  Treino {index + 1}
                </span>
                <span className={`text-xs font-bold block truncate ${isNext ? 'text-white' : 'text-slate-300'}`}>
                  {w.name.replace(/Treino \d+ — /i, '')}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {w.exercises.length} exercícios
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises planned for this workout */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4.5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Exercícios deste Treino</h3>
          <span className="text-xs text-slate-400">{nextWorkout.exercises.length} itens</span>
        </div>

        <div className="space-y-2">
          {nextWorkout.exercises.map((cfg, idx) => {
            const exInfo = cfg.exercise || { name: 'Exercício', muscleGroup: 'outro' };
            return (
              <div
                key={cfg.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{exInfo.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {cfg.targetSets} séries × {cfg.targetReps} reps • descanso {cfg.restSeconds}s
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {cfg.targetLoadKg} kg
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
