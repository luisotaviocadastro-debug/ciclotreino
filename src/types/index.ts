export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'pernas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'abdomen'
  | 'panturrilha'
  | 'trapezio'
  | 'corpo_todo'
  | 'outro';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birthDate?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';
  weightKg?: number;
  goal?: 'hipertrofia' | 'forca' | 'resistencia' | 'emagrecimento' | 'saude';
  defaultRestSeconds: number;
  defaultProgressionType: 'carga' | 'repeticoes';
  defaultProgressionPercent: number; // e.g., 10 for 10%
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  userId: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets?: number;
  defaultReps?: number;
  defaultRestSeconds?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExerciseConfig {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetLoadKg: number;
  restSeconds: number;
  notes?: string;
  // Denormalized for rapid access in offline mode
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  cycleId: string;
  userId: string;
  name: string; // e.g. "Treino 1 — Peito + Bíceps"
  orderIndex: number; // 0, 1, 2, 3...
  notes?: string;
  exercises: WorkoutExerciseConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface Cycle {
  id: string;
  userId: string;
  name: string; // e.g. "Ciclo Hipertrofia 4x"
  description?: string;
  isActive: boolean;
  workouts: Workout[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  loadKg: number;
  repsPerformed: number;
  targetReps: number;
  completed: boolean;
  completedAt?: string;
  restTimeSeconds?: number;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  sets: SessionSet[];
  lastLoadKg?: number;
  nextSuggestedLoadKg?: number;
  nextSuggestedReps?: number;
  progressionNote?: string;
  progressionAccepted?: boolean;
  isFinished?: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  cycleId: string;
  workoutName: string;
  cycleName: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  totalReps: number;
  totalSets: number;
  notes?: string;
  exercises: SessionExercise[];
}

export interface ExerciseProgressionHistory {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sessionId: string;
  date: string;
  loadKg: number;
  setsCompleted: number;
  repsList: number[];
  targetReps: number;
  metTarget: boolean;
  suggestedLoadKg?: number;
  suggestedReps?: number;
  appliedLoadKg?: number;
  appliedReps?: number;
  progressionType: 'carga' | 'repeticoes' | 'manter';
  percentageApplied?: number;
  notes?: string;
}

export interface RestTimerState {
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  currentSetNumber: number;
  currentExerciseName: string;
  startedAt?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
