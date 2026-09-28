import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Cycle } from '../../types';
import {
  Layers,
  Plus,
  Check,
  CheckCircle2,
  X,
  Edit3,
  Trash2,
  PlusCircle,
  Dumbbell,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Minus,
} from 'lucide-react';

interface EditableWorkoutState {
  id?: string;
  name: string;
  exercisesConfig: {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    targetLoadKg: number;
    restSeconds: number;
  }[];
}

export const CyclesScreen: React.FC = () => {
  const {
    cycles,
    activeCycle,
    setActiveCycleId,
    createNewCycle,
    updateCycle,
    deleteCycle,
    exercises: allExercises,
  } = useWorkout();

  // Create Cycle State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleDesc, setCycleDesc] = useState('');
  const [workoutCount, setWorkoutCount] = useState<number>(3);
  const [customWorkoutNames, setCustomWorkoutNames] = useState<string[]>([
    'Treino 1 — Push (Peito, Ombro, Tríceps)',
    'Treino 2 — Pull (Costas, Trapézio, Bíceps)',
    'Treino 3 — Legs (Pernas Completas)',
  ]);

  // Edit Cycle State
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editWorkouts, setEditWorkouts] = useState<EditableWorkoutState[]>([]);
  const [selectedWorkoutIndexForExercises, setSelectedWorkoutIndexForExercises] = useState<number | null>(null);

  // Deletion Confirm State
  const [cycleToDelete, setCycleToDelete] = useState<Cycle | null>(null);

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

  // Open Edit Cycle
  const handleOpenEdit = (c: Cycle) => {
    setEditingCycle(c);
    setEditName(c.name);
    setEditDesc(c.description || '');
    setEditWorkouts(
      c.workouts
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((w) => ({
          id: w.id,
          name: w.name,
          exercisesConfig: w.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            targetSets: e.targetSets || 4,
            targetReps: e.targetReps || 10,
            targetLoadKg: e.targetLoadKg || 20,
            restSeconds: e.restSeconds || 90,
          })),
        }))
    );
    setSelectedWorkoutIndexForExercises(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCycle || !editName.trim()) return;
    if (editWorkouts.length === 0) return;

    updateCycle(editingCycle.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      workouts: editWorkouts,
    });

    setEditingCycle(null);
  };

  const handleAddWorkoutToEdit = () => {
    const newIdx = editWorkouts.length + 1;
    setEditWorkouts((prev) => [
      ...prev,
      {
        name: `Treino ${newIdx} — Novo`,
        exercisesConfig: [],
      },
    ]);
  };

  const handleRemoveWorkoutFromEdit = (index: number) => {
    if (editWorkouts.length <= 1) return;
    setEditWorkouts((prev) => prev.filter((_, i) => i !== index));
    if (selectedWorkoutIndexForExercises === index) {
      setSelectedWorkoutIndexForExercises(null);
    }
  };

  const handleMoveWorkoutInEdit = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editWorkouts.length) return;
    const updated = [...editWorkouts];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setEditWorkouts(updated);
  };

  const handleToggleExerciseInWorkout = (workoutIndex: number, exerciseId: string) => {
    setEditWorkouts((prev) => {
      const copy = [...prev];
      const target = { ...copy[workoutIndex] };
      const exists = target.exercisesConfig.some((cfg) => cfg.exerciseId === exerciseId);
      const exDef = allExercises.find((e) => e.id === exerciseId);

      if (exists) {
        target.exercisesConfig = target.exercisesConfig.filter((cfg) => cfg.exerciseId !== exerciseId);
      } else {
        target.exercisesConfig = [
          ...target.exercisesConfig,
          {
            exerciseId,
            targetSets: exDef?.defaultSets || 4,
            targetReps: exDef?.defaultReps || 10,
            targetLoadKg: 20,
            restSeconds: exDef?.defaultRestSeconds || 90,
          },
        ];
      }
      copy[workoutIndex] = target;
      return copy;
    });
  };

  const handleUpdateExerciseSets = (workoutIndex: number, exerciseId: string, delta: number) => {
    setEditWorkouts((prev) => {
      const copy = [...prev];
      const target = { ...copy[workoutIndex] };
      target.exercisesConfig = target.exercisesConfig.map((cfg) => {
        if (cfg.exerciseId !== exerciseId) return cfg;
        const newSets = Math.max(1, Math.min(10, cfg.targetSets + delta));
        return { ...cfg, targetSets: newSets };
      });
      copy[workoutIndex] = target;
      return copy;
    });
  };

  const confirmDeleteCycle = () => {
    if (!cycleToDelete) return;
    deleteCycle(cycleToDelete.id);
    setCycleToDelete(null);
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Ciclos de Treino</h2>
          <p className="text-xs text-slate-400">
            Crie, personalize ou edite a sequência e séries dos treinos
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              {activeCycle.workouts.length} treinos contínuos
            </span>
            <button
              onClick={() => handleOpenEdit(activeCycle)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition flex items-center gap-1 text-[11px] font-bold px-2.5 cursor-pointer"
              title="Editar este ciclo"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
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

              <div className="flex items-center gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Editar ciclo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete Button (if not the only one) */}
                {cycles.length > 1 && (
                  <button
                    onClick={() => setCycleToDelete(c)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition cursor-pointer"
                    title="Excluir ciclo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {isActive ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    Ativo
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveCycleId(c.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition cursor-pointer"
                  >
                    Ativar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT CYCLE MODAL */}
      {editingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Editar Ciclo de Treino</h3>
              </div>
              <button
                onClick={() => setEditingCycle(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nome do Ciclo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Workouts in Sequence */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Treinos na Sequência ({editWorkouts.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddWorkoutToEdit}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Adicionar Treino</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editWorkouts.map((w, wIdx) => {
                    const isConfiguringExercises = selectedWorkoutIndexForExercises === wIdx;

                    return (
                      <div
                        key={wIdx}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                            {wIdx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={w.name}
                            onChange={(e) => {
                              const updated = [...editWorkouts];
                              updated[wIdx] = { ...updated[wIdx], name: e.target.value };
                              setEditWorkouts(updated);
                            }}
                            className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Nome do treino (ex: Treino A - Costas)"
                          />

                          {/* Reorder and Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={wIdx === 0}
                              onClick={() => handleMoveWorkoutInEdit(wIdx, 'up')}
                              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Subir posição"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={wIdx === editWorkouts.length - 1}
                              onClick={() => handleMoveWorkoutInEdit(wIdx, 'down')}
                              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Descer posição"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            {editWorkouts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveWorkoutFromEdit(wIdx)}
                                className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-500/20 cursor-pointer"
                                title="Remover este treino"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Exercises summary & toggle */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedWorkoutIndexForExercises(
                                isConfiguringExercises ? null : wIdx
                              )
                            }
                            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 font-semibold transition cursor-pointer"
                          >
                            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {w.exercisesConfig.length}{' '}
                              {w.exercisesConfig.length === 1 ? 'exercício selecionado' : 'exercícios selecionados'}
                            </span>
                            <span className="text-[10px] text-slate-500 underline ml-1">
                              {isConfiguringExercises ? 'Fechar lista' : 'Configurar lista e séries'}
                            </span>
                          </button>
                        </div>

                        {/* Exercise selection dropdown panel with Sets stepper */}
                        {isConfiguringExercises && (
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 mt-2">
                            <span className="text-[11px] font-bold text-slate-400 block mb-1">
                              Selecione os exercícios e ajuste as séries:
                            </span>
                            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                              {allExercises.map((ex) => {
                                const selectedConfig = w.exercisesConfig.find((cfg) => cfg.exerciseId === ex.id);
                                const isSelected = Boolean(selectedConfig);

                                return (
                                  <div
                                    key={ex.id}
                                    className={`p-2 rounded-xl border text-xs transition ${
                                      isSelected
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                        : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <label className="flex items-center gap-2 truncate cursor-pointer flex-1">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => handleToggleExerciseInWorkout(wIdx, ex.id)}
                                          className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                                        />
                                        <span className="font-semibold truncate">{ex.name}</span>
                                      </label>
                                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                        {ex.muscleGroup}
                                      </span>
                                    </div>

                                    {/* Number of Sets Controller for this Exercise */}
                                    {isSelected && selectedConfig && (
                                      <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold text-[11px]">
                                          Séries Padrão:
                                        </span>
                                        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-emerald-500/30">
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateExerciseSets(wIdx, ex.id, -1)}
                                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className="font-mono font-black text-emerald-400 w-5 text-center">
                                            {selectedConfig.targetSets}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateExerciseSets(wIdx, ex.id, 1)}
                                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                          <span className="text-[10px] text-slate-500 ml-0.5">séries</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCycle(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CYCLE MODAL */}
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
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  Criar e Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {cycleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
            <h3 className="text-base font-black text-white">Excluir Ciclo?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Tem certeza que deseja excluir o ciclo{' '}
              <strong className="text-white font-bold">"{cycleToDelete.name}"</strong>? O histórico de treinos concluídos não será perdido.
            </p>

            <div className="pt-4 mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCycleToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteCycle}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black shadow-lg shadow-red-500/20 transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
