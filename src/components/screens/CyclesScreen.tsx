import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Layers, Plus, Check, CheckCircle2, ChevronRight, X } from 'lucide-react';

export const CyclesScreen: React.FC = () => {
  const { cycles, activeCycle, setActiveCycleId, createNewCycle } = useWorkout();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleDesc, setCycleDesc] = useState('');
  const [workoutCount, setWorkoutCount] = useState<number>(3);
  const [customWorkoutNames, setCustomWorkoutNames] = useState<string[]>([
    'Treino 1 — Push (Peito, Ombro, Tríceps)',
    'Treino 2 — Pull (Costas, Trapézio, Bíceps)',
    'Treino 3 — Legs (Pernas Completas)',
  ]);

  const handleWorkoutCountChange = (count: number) => {
    setWorkoutCount(count);
    const updated = Array.from({ length: count }, (_, idx) => {
      if (customWorkoutNames[idx]) return customWorkoutNames[idx];
      return `Treino ${idx + 1} — Personalizado`;
    });
    setCustomWorkoutNames(updated);
  };

  const handleWorkoutNameChange = (index: number, val: string) => {
    const updated = [...customWorkoutNames];
    updated[index] = val;
    setCustomWorkoutNames(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName.trim()) return;
    createNewCycle(cycleName.trim(), cycleDesc.trim(), customWorkoutNames);
    setIsCreateModalOpen(false);
    setCycleName('');
    setCycleDesc('');
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Ciclos de Treino</h2>
          <p className="text-xs text-slate-400">
            Alterne entre divisões sem perder seu histórico
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Ciclo</span>
        </button>
      </div>

      {/* Active Cycle Spotlight */}
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ciclo Atualmente Ativo
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {activeCycle.workouts.length} treinos contínuos
          </span>
        </div>

        <h3 className="text-xl font-black text-white">{activeCycle.name}</h3>
        {activeCycle.description && (
          <p className="text-xs text-slate-400 mt-1">{activeCycle.description}</p>
        )}

        {/* Ordered Workouts in this Cycle */}
        <div className="mt-4 space-y-2">
          {activeCycle.workouts
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((w, idx) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-white">{w.name}</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {w.exercises.length} exercícios
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Other Cycles List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Todos os Ciclos Cadastrados
        </h4>

        {cycles.map((c) => {
          const isActive = c.id === activeCycle.id;
          return (
            <div
              key={c.id}
              className={`p-4 rounded-3xl border transition flex items-center justify-between ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  <span className="text-[11px] text-slate-400">
                    {c.workouts.length} treinos na sequência
                  </span>
                </div>
              </div>

              <div>
                {isActive ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    Ativo
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveCycleId(c.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                  >
                    Ativar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Cycle Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Criar Novo Ciclo</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nome do Ciclo *
                </label>
                <input
                  type="text"
                  required
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  placeholder="Ex: Ciclo ABC Hipertrofia"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={cycleDesc}
                  onChange={(e) => setCycleDesc(e.target.value)}
                  placeholder="Ex: Divisão de 3 dias para força e hipertrofia"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Quantidade de Treinos na Sequência
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => handleWorkoutCountChange(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        workoutCount === num
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout names inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Nomes dos Treinos (em ordem de execução)
                </label>
                {customWorkoutNames.map((wName, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 text-right font-mono text-xs text-slate-500 font-bold">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      required
                      value={wName}
                      onChange={(e) => handleWorkoutNameChange(idx, e.target.value)}
                      className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition"
                >
                  Criar e Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
