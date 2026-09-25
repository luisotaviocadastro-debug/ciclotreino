import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { ChevronLeft, ChevronRight, CheckCircle2, Moon } from 'lucide-react';
import { WorkoutSession } from '../../types';

export const CalendarScreen: React.FC = () => {
  const { sessions } = useWorkout();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDaySessions, setSelectedDaySessions] = useState<{
    dateStr: string;
    sessions: WorkoutSession[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Compute calendar grid for the month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week index (0 = Sunday, 1 = Monday). We adjust for Brazilian standard: Monday = 0
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6; // Sunday becomes index 6

  const daysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDaySessions(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDaySessions(null);
  };

  // Group sessions by day string (YYYY-MM-DD)
  const sessionsByDay = sessions.reduce<Record<string, WorkoutSession[]>>((acc, sess) => {
    const dStr = sess.startedAt.split('T')[0];
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(sess);
    return acc;
  }, {});

  const handleSelectDay = (day: number) => {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySessions = sessionsByDay[formattedDay] || [];
    setSelectedDaySessions({
      dateStr: formattedDay,
      sessions: daySessions,
    });
  };

  const dayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      {/* Month Navigator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-black capitalize text-white tracking-wide">
          {monthName}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayHeaders.map((dh) => (
            <span key={dh} className="text-[11px] font-bold text-slate-500 uppercase">
              {dh}
            </span>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty prefix cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-11 rounded-xl bg-slate-950/20" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const trained = sessionsByDay[dateStr];
            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDaySessions?.dateStr === dateStr;

            return (
              <button
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition border active:scale-95 ${
                  isSelected
                    ? 'border-emerald-400 bg-slate-800 ring-2 ring-emerald-500/20'
                    : trained
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-white'
                    : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold ${
                    isToday ? 'text-emerald-400 underline underline-offset-2' : ''
                  }`}
                >
                  {dayNum}
                </span>

                {trained && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Breakdown */}
      {selectedDaySessions && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Data: {selectedDaySessions.dateStr.split('-').reverse().join('/')}
            </span>
            <span className="text-[11px] text-slate-500">
              {selectedDaySessions.sessions.length > 0
                ? `${selectedDaySessions.sessions.length} treino(s) realizado(s)`
                : 'Dia de Descanso'}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {selectedDaySessions.sessions.length === 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                <Moon className="w-4 h-4 text-slate-500" />
                <span>Nenhum treino realizado nesta data. Descanso e recuperação muscular.</span>
              </div>
            ) : (
              selectedDaySessions.sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {s.workoutName}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {s.totalVolumeKg} kg
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {s.totalSets} séries concluídas • Duração: {Math.floor(s.durationSeconds / 60)} min
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Philosophical Reminder note */}
      <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
        <span className="font-bold text-slate-300 block mb-1">Como o calendário funciona:</span>
        O calendário serve como registro histórico da sua consistência e dos dias de descanso.
        Ele <strong className="text-white">nunca dita</strong> qual treino você deve fazer hoje; a sequência do ciclo continua de onde você parou, mesmo após dias de intervalo.
      </div>
    </div>
  );
};
