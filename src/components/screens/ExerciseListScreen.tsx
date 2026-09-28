import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Exercise, MuscleGroup } from '../../types';
import { Search, Plus, Dumbbell, ChevronRight, X, Edit3, Minus } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';

export const ExerciseListScreen: React.FC = () => {
  const { exercises, addExerciseToLibrary, updateExerciseInLibrary, progressions } = useWorkout();

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // New exercise form state
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('peito');
  const [newSets, setNewSets] = useState<number>(4);
  const [newReps, setNewReps] = useState<number>(10);
  const [newNotes, setNewNotes] = useState('');

  // Editing existing exercise state
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState('');
  const [editMuscle, setEditMuscle] = useState<MuscleGroup>('peito');
  const [editSets, setEditSets] = useState<number>(4);
  const [editReps, setEditReps] = useState<number>(10);
  const [editNotes, setEditNotes] = useState('');

  const muscleFilters = [
    { id: 'todos', label: 'Todos' },
    { id: 'peito', label: 'Peito' },
    { id: 'costas', label: 'Costas' },
    { id: 'pernas', label: 'Pernas' },
    { id: 'ombros', label: 'Ombros' },
    { id: 'biceps', label: 'Bíceps' },
    { id: 'triceps', label: 'Tríceps' },
    { id: 'abdomen', label: 'Abdômen' },
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'todos' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = addExerciseToLibrary(
      newName.trim(),
      newMuscle,
      newNotes.trim() || undefined,
      newSets,
      newReps
    );
    setNewName('');
    setNewNotes('');
    setNewSets(4);
    setNewReps(10);
    setIsAddModalOpen(false);
    setSelectedExercise(created);
  };

  const handleOpenEdit = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExercise(ex);
    setEditName(ex.name);
    setEditMuscle(ex.muscleGroup);
    setEditSets(ex.defaultSets || 4);
    setEditReps(ex.defaultReps || 10);
    setEditNotes(ex.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !editName.trim()) return;
    updateExerciseInLibrary(editingExercise.id, {
      name: editName.trim(),
      muscleGroup: editMuscle,
      defaultSets: editSets,
      defaultReps: editReps,
      notes: editNotes.trim() || undefined,
    });
    setEditingExercise(null);
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Biblioteca de Exercícios</h2>
          <p className="text-xs text-slate-400">
            {exercises.length} exercícios cadastrados com histórico e séries configuráveis
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar exercício por nome..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Muscle Group Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {muscleFilters.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMuscle(m.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedMuscle === m.id
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="space-y-2">
        {filteredExercises.map((ex) => {
          const exProgressions = progressions.filter((p) => p.exerciseId === ex.id);
          const hasHistory = exProgressions.length > 0;
          const latestProgression = hasHistory ? exProgressions[0] : null;

          return (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="p-3.5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {ex.muscleGroup}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {ex.defaultSets || 4} séries padrão
                    </span>
                    {latestProgression && (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {latestProgression.appliedLoadKg || latestProgression.loadKg} kg
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(ex, e)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Editar configurações deste exercício"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT EXERCISE MODAL */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Editar Exercício</h3>
              </div>
              <button
                onClick={() => setEditingExercise(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Grupo Muscular *
                </label>
                <select
                  value={editMuscle}
                  onChange={(e) => setEditMuscle(e.target.value as MuscleGroup)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="peito">Peito</option>
                  <option value="costas">Costas</option>
                  <option value="pernas">Pernas</option>
                  <option value="ombros">Ombros</option>
                  <option value="biceps">Bíceps</option>
                  <option value="triceps">Tríceps</option>
                  <option value="abdomen">Abdômen</option>
                  <option value="panturrilha">Panturrilha</option>
                  <option value="trapezio">Trapézio</option>
                  <option value="corpo_todo">Corpo Todo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Default Sets and Reps Config */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Séries Padrão
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditSets((prev) => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 font-mono font-black text-center text-emerald-400 text-sm">
                      {editSets}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditSets((prev) => Math.min(10, prev + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Reps Meta Padrão
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditReps((prev) => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 font-mono font-black text-center text-emerald-400 text-sm">
                      {editReps}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditReps((prev) => Math.min(50, prev + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Observações ou Dicas (Opcional)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXERCISE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Cadastrar Exercício</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Tríceps Francês no Halter"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Grupo Muscular *
                </label>
                <select
                  value={newMuscle}
                  onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="peito">Peito</option>
                  <option value="costas">Costas</option>
                  <option value="pernas">Pernas</option>
                  <option value="ombros">Ombros</option>
                  <option value="biceps">Bíceps</option>
                  <option value="triceps">Tríceps</option>
                  <option value="abdomen">Abdômen</option>
                  <option value="panturrilha">Panturrilha</option>
                  <option value="trapezio">Trapézio</option>
                  <option value="corpo_todo">Corpo Todo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Sets and Reps Config */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Séries Padrão
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewSets((prev) => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 font-mono font-black text-center text-emerald-400 text-sm">
                      {newSets}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewSets((prev) => Math.min(10, prev + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Reps Meta
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewReps((prev) => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 font-mono font-black text-center text-emerald-400 text-sm">
                      {newReps}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewReps((prev) => Math.min(50, prev + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Observações ou Dicas (Opcional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Focar na cadência lenta excêntrica"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};
