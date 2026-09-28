import {
  Cycle,
  Exercise,
  Workout,
  WorkoutSession,
  UserProfile,
  ExerciseProgressionHistory,
  WorkoutExerciseConfig,
} from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'ciclotreino_user_profile',
  CYCLES: 'ciclotreino_cycles',
  EXERCISES: 'ciclotreino_exercises',
  SESSIONS: 'ciclotreino_sessions',
  PROGRESSIONS: 'ciclotreino_progressions',
  ACTIVE_SESSION: 'ciclotreino_active_session',
  NEXT_WORKOUT_OVERRIDE: 'ciclotreino_next_workout_override',
};

// Default Initial Seed Data
const DEFAULT_USER_ID = 'local-user-atleta';

const DEFAULT_PROFILE: UserProfile = {
  id: DEFAULT_USER_ID,
  email: 'atleta@ciclotreino.app',
  name: 'Atleta',
  weightKg: 78.5,
  goal: 'hipertrofia',
  defaultRestSeconds: 90,
  defaultProgressionType: 'carga',
  defaultProgressionPercent: 10,
  soundEnabled: true,
  vibrationEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    userId: DEFAULT_USER_ID,
    name: 'Supino Reto com Barra',
    muscleGroup: 'peito',
    defaultRestSeconds: 90,
    notes: 'Escápulas travadas e pés firmes no chão.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-2',
    userId: DEFAULT_USER_ID,
    name: 'Supino Inclinado com Halteres',
    muscleGroup: 'peito',
    defaultRestSeconds: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-3',
    userId: DEFAULT_USER_ID,
    name: 'Rosca Direta com Barra W',
    muscleGroup: 'biceps',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-4',
    userId: DEFAULT_USER_ID,
    name: 'Rosca Martelo com Halteres',
    muscleGroup: 'biceps',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-5',
    userId: DEFAULT_USER_ID,
    name: 'Agachamento Livre',
    muscleGroup: 'pernas',
    defaultRestSeconds: 120,
    notes: 'Descer até quebrar a paralela mantendo a coluna alinhada.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-6',
    userId: DEFAULT_USER_ID,
    name: 'Leg Press 45°',
    muscleGroup: 'pernas',
    defaultRestSeconds: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-7',
    userId: DEFAULT_USER_ID,
    name: 'Cadeira Extensora',
    muscleGroup: 'pernas',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-8',
    userId: DEFAULT_USER_ID,
    name: 'Desenvolvimento Militar com Halteres',
    muscleGroup: 'ombros',
    defaultRestSeconds: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-9',
    userId: DEFAULT_USER_ID,
    name: 'Elevação Lateral',
    muscleGroup: 'ombros',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-10',
    userId: DEFAULT_USER_ID,
    name: 'Tríceps na Corda (Polia)',
    muscleGroup: 'triceps',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-11',
    userId: DEFAULT_USER_ID,
    name: 'Tríceps Testa com Barra W',
    muscleGroup: 'triceps',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-12',
    userId: DEFAULT_USER_ID,
    name: 'Puxada Frontal Aberta',
    muscleGroup: 'costas',
    defaultRestSeconds: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-13',
    userId: DEFAULT_USER_ID,
    name: 'Remada Curvada com Barra',
    muscleGroup: 'costas',
    defaultRestSeconds: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-14',
    userId: DEFAULT_USER_ID,
    name: 'Abdominal Supra na Prancha',
    muscleGroup: 'abdomen',
    defaultRestSeconds: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_CYCLE_ID = 'cycle-1';

const DEFAULT_WORKOUT_1_EXERCISES: WorkoutExerciseConfig[] = [
  {
    id: 'we-1',
    workoutId: 'w-1',
    exerciseId: 'ex-1',
    orderIndex: 0,
    targetSets: 4,
    targetReps: 10,
    targetLoadKg: 40,
    restSeconds: 90,
    notes: 'Começar com carga moderada e boa cadência',
  },
  {
    id: 'we-2',
    workoutId: 'w-1',
    exerciseId: 'ex-2',
    orderIndex: 1,
    targetSets: 3,
    targetReps: 10,
    targetLoadKg: 22,
    restSeconds: 90,
  },
  {
    id: 'we-3',
    workoutId: 'w-1',
    exerciseId: 'ex-3',
    orderIndex: 2,
    targetSets: 3,
    targetReps: 10,
    targetLoadKg: 18,
    restSeconds: 60,
  },
  {
    id: 'we-4',
    workoutId: 'w-1',
    exerciseId: 'ex-4',
    orderIndex: 3,
    targetSets: 3,
    targetReps: 12,
    targetLoadKg: 12,
    restSeconds: 60,
  },
];

const DEFAULT_WORKOUT_2_EXERCISES: WorkoutExerciseConfig[] = [
  {
    id: 'we-5',
    workoutId: 'w-2',
    exerciseId: 'ex-5',
    orderIndex: 0,
    targetSets: 4,
    targetReps: 8,
    targetLoadKg: 60,
    restSeconds: 120,
  },
  {
    id: 'we-6',
    workoutId: 'w-2',
    exerciseId: 'ex-6',
    orderIndex: 1,
    targetSets: 4,
    targetReps: 10,
    targetLoadKg: 140,
    restSeconds: 90,
  },
  {
    id: 'we-7',
    workoutId: 'w-2',
    exerciseId: 'ex-7',
    orderIndex: 2,
    targetSets: 3,
    targetReps: 12,
    targetLoadKg: 45,
    restSeconds: 60,
  },
];

const DEFAULT_WORKOUT_3_EXERCISES: WorkoutExerciseConfig[] = [
  {
    id: 'we-8',
    workoutId: 'w-3',
    exerciseId: 'ex-8',
    orderIndex: 0,
    targetSets: 4,
    targetReps: 10,
    targetLoadKg: 16,
    restSeconds: 90,
  },
  {
    id: 'we-9',
    workoutId: 'w-3',
    exerciseId: 'ex-9',
    orderIndex: 1,
    targetSets: 4,
    targetReps: 12,
    targetLoadKg: 10,
    restSeconds: 60,
  },
  {
    id: 'we-10',
    workoutId: 'w-3',
    exerciseId: 'ex-10',
    orderIndex: 2,
    targetSets: 3,
    targetReps: 10,
    targetLoadKg: 30,
    restSeconds: 60,
  },
  {
    id: 'we-11',
    workoutId: 'w-3',
    exerciseId: 'ex-11',
    orderIndex: 3,
    targetSets: 3,
    targetReps: 10,
    targetLoadKg: 20,
    restSeconds: 60,
  },
];

const DEFAULT_WORKOUT_4_EXERCISES: WorkoutExerciseConfig[] = [
  {
    id: 'we-12',
    workoutId: 'w-4',
    exerciseId: 'ex-12',
    orderIndex: 0,
    targetSets: 4,
    targetReps: 10,
    targetLoadKg: 50,
    restSeconds: 90,
  },
  {
    id: 'we-13',
    workoutId: 'w-4',
    exerciseId: 'ex-13',
    orderIndex: 1,
    targetSets: 4,
    targetReps: 10,
    targetLoadKg: 45,
    restSeconds: 90,
  },
  {
    id: 'we-14',
    workoutId: 'w-4',
    exerciseId: 'ex-14',
    orderIndex: 2,
    targetSets: 3,
    targetReps: 15,
    targetLoadKg: 0,
    restSeconds: 60,
  },
];

const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: 'w-1',
    cycleId: DEFAULT_CYCLE_ID,
    userId: DEFAULT_USER_ID,
    name: 'Treino 1 — Peito + Bíceps',
    orderIndex: 0,
    exercises: DEFAULT_WORKOUT_1_EXERCISES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-2',
    cycleId: DEFAULT_CYCLE_ID,
    userId: DEFAULT_USER_ID,
    name: 'Treino 2 — Pernas',
    orderIndex: 1,
    exercises: DEFAULT_WORKOUT_2_EXERCISES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-3',
    cycleId: DEFAULT_CYCLE_ID,
    userId: DEFAULT_USER_ID,
    name: 'Treino 3 — Ombros + Tríceps',
    orderIndex: 2,
    exercises: DEFAULT_WORKOUT_3_EXERCISES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-4',
    cycleId: DEFAULT_CYCLE_ID,
    userId: DEFAULT_USER_ID,
    name: 'Treino 4 — Costas & Abdômen',
    orderIndex: 3,
    exercises: DEFAULT_WORKOUT_4_EXERCISES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_CYCLE: Cycle = {
  id: DEFAULT_CYCLE_ID,
  userId: DEFAULT_USER_ID,
  name: 'Ciclo Principal (4 Treinos)',
  description: 'Sequência contínua: Peito/Bíceps → Pernas → Ombros/Tríceps → Costas',
  isActive: true,
  workouts: DEFAULT_WORKOUTS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Seed realistic previous sessions (e.g. Treino 1 and Treino 2 done recently, making Treino 3 next, exactly as in AppMusculacao.txt)
const now = new Date();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

const SEED_SESSIONS: WorkoutSession[] = [
  {
    id: 'sess-1',
    userId: DEFAULT_USER_ID,
    workoutId: 'w-1',
    cycleId: DEFAULT_CYCLE_ID,
    workoutName: 'Treino 1 — Peito + Bíceps',
    cycleName: 'Ciclo Principal (4 Treinos)',
    startedAt: fourDaysAgo.toISOString(),
    completedAt: new Date(fourDaysAgo.getTime() + 52 * 60 * 1000).toISOString(),
    durationSeconds: 52 * 60,
    totalVolumeKg: 3240,
    totalReps: 120,
    totalSets: 13,
    notes: 'Treino forte, boa intensidade no supino.',
    exercises: [
      {
        id: 'se-1',
        sessionId: 'sess-1',
        exerciseId: 'ex-1',
        exerciseName: 'Supino Reto com Barra',
        muscleGroup: 'peito',
        orderIndex: 0,
        targetSets: 4,
        targetReps: 10,
        restSeconds: 90,
        isFinished: true,
        lastLoadKg: 40,
        nextSuggestedLoadKg: 44,
        sets: [
          { id: 's-1-1', sessionExerciseId: 'se-1', setNumber: 1, loadKg: 40, repsPerformed: 10, targetReps: 10, completed: true },
          { id: 's-1-2', sessionExerciseId: 'se-1', setNumber: 2, loadKg: 40, repsPerformed: 10, targetReps: 10, completed: true },
          { id: 's-1-3', sessionExerciseId: 'se-1', setNumber: 3, loadKg: 40, repsPerformed: 10, targetReps: 10, completed: true },
          { id: 's-1-4', sessionExerciseId: 'se-1', setNumber: 4, loadKg: 40, repsPerformed: 10, targetReps: 10, completed: true },
        ],
      },
      {
        id: 'se-2',
        sessionId: 'sess-1',
        exerciseId: 'ex-3',
        exerciseName: 'Rosca Direta com Barra W',
        muscleGroup: 'biceps',
        orderIndex: 1,
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
        isFinished: true,
        lastLoadKg: 18,
        nextSuggestedLoadKg: 20,
        sets: [
          { id: 's-2-1', sessionExerciseId: 'se-2', setNumber: 1, loadKg: 18, repsPerformed: 10, targetReps: 10, completed: true },
          { id: 's-2-2', sessionExerciseId: 'se-2', setNumber: 2, loadKg: 18, repsPerformed: 10, targetReps: 10, completed: true },
          { id: 's-2-3', sessionExerciseId: 'se-2', setNumber: 3, loadKg: 18, repsPerformed: 10, targetReps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess-2',
    userId: DEFAULT_USER_ID,
    workoutId: 'w-2',
    cycleId: DEFAULT_CYCLE_ID,
    workoutName: 'Treino 2 — Pernas',
    cycleName: 'Ciclo Principal (4 Treinos)',
    startedAt: twoDaysAgo.toISOString(),
    completedAt: new Date(twoDaysAgo.getTime() + 61 * 60 * 1000).toISOString(),
    durationSeconds: 61 * 60,
    totalVolumeKg: 7820,
    totalReps: 104,
    totalSets: 11,
    notes: 'Perna bem cansada, agachamento consistente.',
    exercises: [
      {
        id: 'se-3',
        sessionId: 'sess-2',
        exerciseId: 'ex-5',
        exerciseName: 'Agachamento Livre',
        muscleGroup: 'pernas',
        orderIndex: 0,
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
        isFinished: true,
        lastLoadKg: 60,
        nextSuggestedLoadKg: 66,
        sets: [
          { id: 's-3-1', sessionExerciseId: 'se-3', setNumber: 1, loadKg: 60, repsPerformed: 8, targetReps: 8, completed: true },
          { id: 's-3-2', sessionExerciseId: 'se-3', setNumber: 2, loadKg: 60, repsPerformed: 8, targetReps: 8, completed: true },
          { id: 's-3-3', sessionExerciseId: 'se-3', setNumber: 3, loadKg: 60, repsPerformed: 8, targetReps: 8, completed: true },
          { id: 's-3-4', sessionExerciseId: 'se-3', setNumber: 4, loadKg: 60, repsPerformed: 8, targetReps: 8, completed: true },
        ],
      },
    ],
  },
];

const SEED_PROGRESSIONS: ExerciseProgressionHistory[] = [
  {
    id: 'p-1',
    exerciseId: 'ex-1',
    exerciseName: 'Supino Reto com Barra',
    sessionId: 'sess-1',
    date: fourDaysAgo.toISOString().split('T')[0],
    loadKg: 40,
    setsCompleted: 4,
    repsList: [10, 10, 10, 10],
    targetReps: 10,
    metTarget: true,
    suggestedLoadKg: 44,
    suggestedReps: 10,
    appliedLoadKg: 44,
    progressionType: 'carga',
    percentageApplied: 10,
    notes: 'Meta cumprida. Sugestão aceita +10%.',
  },
  {
    id: 'p-2',
    exerciseId: 'ex-3',
    exerciseName: 'Rosca Direta com Barra W',
    sessionId: 'sess-1',
    date: fourDaysAgo.toISOString().split('T')[0],
    loadKg: 18,
    setsCompleted: 3,
    repsList: [10, 10, 10],
    targetReps: 10,
    metTarget: true,
    suggestedLoadKg: 20,
    suggestedReps: 10,
    appliedLoadKg: 20,
    progressionType: 'carga',
    percentageApplied: 10,
  },
  {
    id: 'p-3',
    exerciseId: 'ex-5',
    exerciseName: 'Agachamento Livre',
    sessionId: 'sess-2',
    date: twoDaysAgo.toISOString().split('T')[0],
    loadKg: 60,
    setsCompleted: 4,
    repsList: [8, 8, 8, 8],
    targetReps: 8,
    metTarget: true,
    suggestedLoadKg: 66,
    suggestedReps: 8,
    appliedLoadKg: 66,
    progressionType: 'carga',
    percentageApplied: 10,
  },
];

class LocalDataStore {
  // Profile
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  // Cycles
  getCycles(): Cycle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CYCLES);
      if (!data) {
        this.saveCycles([DEFAULT_CYCLE]);
        return [DEFAULT_CYCLE];
      }
      return JSON.parse(data);
    } catch {
      return [DEFAULT_CYCLE];
    }
  }

  saveCycles(cycles: Cycle[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
    } catch (e) {
      console.error('Failed to save cycles', e);
    }
  }

  getActiveCycle(): Cycle {
    const cycles = this.getCycles();
    const active = cycles.find((c) => c.isActive);
    return active || cycles[0] || DEFAULT_CYCLE;
  }

  setActiveCycle(cycleId: string) {
    const cycles = this.getCycles().map((c) => ({
      ...c,
      isActive: c.id === cycleId,
    }));
    this.saveCycles(cycles);
  }

  // Exercises
  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!data) {
        this.saveExercises(DEFAULT_EXERCISES);
        return DEFAULT_EXERCISES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_EXERCISES;
    }
  }

  saveExercises(exercises: Exercise[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    } catch (e) {
      console.error('Failed to save exercises', e);
    }
  }

  addExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Exercise {
    const exercises = this.getExercises();
    const newEx: Exercise = {
      ...exercise,
      id: `ex-${Date.now()}`,
      userId: DEFAULT_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exercises.push(newEx);
    this.saveExercises(exercises);
    return newEx;
  }

  updateExercise(exerciseId: string, updates: Partial<Exercise>): Exercise | null {
    const exercises = this.getExercises();
    const index = exercises.findIndex((e) => e.id === exerciseId);
    if (index === -1) return null;
    exercises[index] = {
      ...exercises[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveExercises(exercises);
    return exercises[index];
  }

  // Sessions
  getSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) {
        this.saveSessions(SEED_SESSIONS);
        return SEED_SESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_SESSIONS;
    }
  }

  saveSessions(sessions: WorkoutSession[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }

  addSession(session: WorkoutSession) {
    const sessions = this.getSessions();
    sessions.unshift(session); // most recent first
    this.saveSessions(sessions);
  }

  // Active in-progress session (so reloading page or gym glitch never loses data)
  getActiveSession(): WorkoutSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveActiveSession(session: WorkoutSession | null) {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    } catch (e) {
      console.error('Failed to save active session', e);
    }
  }

  // Progression history
  getProgressions(): ExerciseProgressionHistory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESSIONS);
      if (!data) {
        this.saveProgressions(SEED_PROGRESSIONS);
        return SEED_PROGRESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PROGRESSIONS;
    }
  }

  saveProgressions(progressions: ExerciseProgressionHistory[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESSIONS, JSON.stringify(progressions));
    } catch (e) {
      console.error('Failed to save progressions', e);
    }
  }

  addProgression(progression: ExerciseProgressionHistory) {
    const list = this.getProgressions();
    list.unshift(progression);
    this.saveProgressions(list);
  }

  getProgressionForExercise(exerciseId: string): ExerciseProgressionHistory[] {
    return this.getProgressions().filter((p) => p.exerciseId === exerciseId);
  }

  /**
   * CORE SPECIFICATION: NEXT WORKOUT IN CONTINUOUS SEQUENCE
   * "Treino 1 → Treino 2 → Treino 3 → Treino 4 → Treino 1..."
   * If last finished workout was Treino 2, next is Treino 3.
   * If last was Treino 4 (last in cycle), next is Treino 1 (wraps around).
   * Independent of days of the week!
   */
  getNextWorkout(activeCycle?: Cycle): {
    nextWorkout: Workout;
    lastSession: WorkoutSession | null;
    positionInCycle: string;
    daysSinceLastWorkout: number | null;
  } {
    const cycle = activeCycle || this.getActiveCycle();
    const sessions = this.getSessions();
    const sortedWorkouts = [...cycle.workouts].sort((a, b) => a.orderIndex - b.orderIndex);

    if (sortedWorkouts.length === 0) {
      return {
        nextWorkout: DEFAULT_WORKOUTS[0],
        lastSession: null,
        positionInCycle: '0 de 0',
        daysSinceLastWorkout: null,
      };
    }

    // Check if user manually overrode the next workout
    const overrideId = localStorage.getItem(STORAGE_KEYS.NEXT_WORKOUT_OVERRIDE);
    if (overrideId) {
      const found = sortedWorkouts.find((w) => w.id === overrideId);
      if (found) {
        const lastSession = sessions.length > 0 ? sessions[0] : null;
        let daysAgo: number | null = null;
        if (lastSession) {
          const diffMs = Date.now() - new Date(lastSession.startedAt).getTime();
          daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
        return {
          nextWorkout: found,
          lastSession,
          positionInCycle: `${found.orderIndex + 1} de ${sortedWorkouts.length}`,
          daysSinceLastWorkout: daysAgo,
        };
      }
    }

    // Find the latest completed session that belongs to this cycle
    const lastSession = sessions.find((s) => s.cycleId === cycle.id) || (sessions.length > 0 ? sessions[0] : null);

    if (!lastSession) {
      // User hasn't finished any workout yet -> start with first workout (orderIndex 0)
      const firstWorkout = sortedWorkouts[0];
      return {
        nextWorkout: firstWorkout,
        lastSession: null,
        positionInCycle: `1 de ${sortedWorkouts.length}`,
        daysSinceLastWorkout: null,
      };
    }

    // Find index of the last workout in the sorted list
    const lastWorkoutIndex = sortedWorkouts.findIndex((w) => w.id === lastSession.workoutId);
    let nextIndex = 0;
    if (lastWorkoutIndex >= 0) {
      // Sequential increment with cycle wrapping
      nextIndex = (lastWorkoutIndex + 1) % sortedWorkouts.length;
    }

    const nextWorkout = sortedWorkouts[nextIndex];
    const diffMs = Date.now() - new Date(lastSession.startedAt).getTime();
    const daysSinceLastWorkout = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    return {
      nextWorkout,
      lastSession,
      positionInCycle: `${nextIndex + 1} de ${sortedWorkouts.length}`,
      daysSinceLastWorkout,
    };
  }

  setNextWorkoutOverride(workoutId: string | null) {
    if (workoutId) {
      localStorage.setItem(STORAGE_KEYS.NEXT_WORKOUT_OVERRIDE, workoutId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.NEXT_WORKOUT_OVERRIDE);
    }
  }

  // Export full user database as JSON
  exportData(): string {
    return JSON.stringify(
      {
        profile: this.getProfile(),
        cycles: this.getCycles(),
        exercises: this.getExercises(),
        sessions: this.getSessions(),
        progressions: this.getProgressions(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  // Import JSON backup
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.cycles) this.saveCycles(data.cycles);
      if (data.exercises) this.saveExercises(data.exercises);
      if (data.sessions) this.saveSessions(data.sessions);
      if (data.progressions) this.saveProgressions(data.progressions);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const store = new LocalDataStore();
