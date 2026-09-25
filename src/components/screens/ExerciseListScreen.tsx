import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Exercise, MuscleGroup } from '../../types';
import { Search, Plus, Dumbbell, ChevronRight, X } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';

export const ExerciseListScreen: React.FC = () => {
  const { exercises, addExerciseToLibrary, progressions } = useWorkout();

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // New exercise form state
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('peito');
  const [newNotes, setNewNotes] = useState('');

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
    const created = addExerciseToLibrary(newName.trim(), newMuscle, newNotes.trim() || undefined);
    setNewName('');
    setNewNotes('');
    setIsAddModalOpen(false);
    setSelectedExercise(created);
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Biblioteca de Exercícios</h2>
          <p className="text-xs text-slate-400">
            {exercises.length} exercícios cadastrados com histórico individual
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition"
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
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
          const lastLoad = hasHistory ? exProgressions[0].loadKg : null;

          return (
            <button
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-left flex items-center justify-between transition active:scale-98 shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-emerald-400 border border-slate-800 shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {ex.muscleGroup}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {hasHistory ? `${exProgressions.length} sessões registradas` : 'Sem histórico'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {lastLoad !== null ? (
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    {lastLoad} kg
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-1 rounded-lg">
                    Novo
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Novo Exercício</h3>
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

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Observações ou Dicas de Execução (Opcional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Focar na extensão completa dos cotovelos"
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
