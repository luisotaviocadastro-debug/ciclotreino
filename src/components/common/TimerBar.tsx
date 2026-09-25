import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Play, Pause, Plus, SkipForward, Timer, X, Volume2, VolumeX, Smartphone } from 'lucide-react';

export const TimerBar: React.FC = () => {
  const {
    restTimer,
    pauseResumeTimer,
    addTimerSeconds,
    skipTimer,
    isTimerModalOpen,
    setIsTimerModalOpen,
    profile,
    updateUserProfile,
  } = useWorkout();

  if (!restTimer.isActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((restTimer.totalSeconds - restTimer.remainingSeconds) / (restTimer.totalSeconds || 1)) * 100)
  );

  return (
    <>
      {/* Floating Bottom Pill - Persistent across entire app */}
      <div
        className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300"
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-2.5 shadow-2xl shadow-emerald-950/40 flex items-center justify-between gap-2.5">
          {/* Progress bar line at top edge */}
          <div
            className="absolute top-0 left-3 right-3 h-1 bg-slate-800 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Time & Exercise Info (tap to expand full modal) */}
          <button
            onClick={() => setIsTimerModalOpen(true)}
            className="flex items-center gap-2.5 pl-1.5 text-left flex-1 min-w-0"
          >
            <div className={`p-2 rounded-xl flex items-center justify-center font-mono font-bold text-base transition-colors ${
              restTimer.remainingSeconds <= 10
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Timer className="w-4 h-4 mr-1.5" />
              <span>{formatTime(restTimer.remainingSeconds)}</span>
            </div>
            <div className="truncate min-w-0">
              <span className="text-xs font-semibold text-slate-200 block truncate">
                {restTimer.currentExerciseName || 'Descanso entre séries'}
              </span>
              <span className="text-[10px] text-slate-400">
                Série {restTimer.currentSetNumber} concluída • Toque p/ ampliar
              </span>
            </div>
          </button>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={pauseResumeTimer}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
              title={restTimer.isPaused ? 'Retomar' : 'Pausar'}
            >
              {restTimer.isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => addTimerSeconds(30)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold active:scale-95 transition flex items-center gap-0.5"
              title="Adicionar 30 segundos"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              <span>30s</span>
            </button>

            <button
              onClick={skipTimer}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white active:scale-95 transition"
              title="Pular descanso"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Full-Screen Modal for Big Rest View */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col items-center text-center relative">
            <button
              onClick={() => setIsTimerModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
              <Timer className="w-3.5 h-3.5" />
              DESCANSO EM ANDAMENTO
            </div>

            <h3 className="text-lg font-bold text-white max-w-[240px] truncate">
              {restTimer.currentExerciseName || 'Próxima Série'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prepare-se para a Série {restTimer.currentSetNumber + 1}
            </p>

            {/* Giant Circular Timer Display */}
            <div className="relative my-7 flex items-center justify-center">
              <svg className="w-56 h-56 transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  className={`transition-all duration-1000 ease-linear ${
                    restTimer.remainingSeconds <= 10 ? 'stroke-red-500' : 'stroke-emerald-400'
                  }`}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 96}
                  strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-5xl font-black tracking-tight text-white">
                  {formatTime(restTimer.remainingSeconds)}
                </span>
                <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                  {restTimer.isPaused ? 'Em Pausa' : 'Restantes'}
                </span>
              </div>
            </div>

            {/* Quick Extension Buttons */}
            <div className="grid grid-cols-3 gap-2 w-full mb-5">
              <button
                onClick={() => addTimerSeconds(15)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold active:scale-95 transition"
              >
                +15s
              </button>
              <button
                onClick={() => addTimerSeconds(30)}
                className="py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold active:scale-95 transition"
              >
                +30s
              </button>
              <button
                onClick={() => addTimerSeconds(60)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold active:scale-95 transition"
              >
                +60s
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={pauseResumeTimer}
                className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition"
              >
                {restTimer.isPaused ? (
                  <>
                    <Play className="w-5 h-5 fill-current text-emerald-400" />
                    <span>Retomar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pausar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  skipTimer();
                  setIsTimerModalOpen(false);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-emerald-500/20"
              >
                <SkipForward className="w-5 h-5" />
                <span>Pular</span>
              </button>
            </div>

            {/* Sound & Vibration Toggles */}
            <div className="flex items-center justify-between w-full mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <button
                onClick={() => updateUserProfile({ soundEnabled: !profile.soundEnabled })}
                className="flex items-center gap-1.5 hover:text-white"
              >
                {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Som: {profile.soundEnabled ? 'Ativo' : 'Mudo'}</span>
              </button>

              <button
                onClick={() => updateUserProfile({ vibrationEnabled: !profile.vibrationEnabled })}
                className="flex items-center gap-1.5 hover:text-white"
              >
                <Smartphone className={`w-4 h-4 ${profile.vibrationEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Vibração: {profile.vibrationEnabled ? 'Ativa' : 'Desat.'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
