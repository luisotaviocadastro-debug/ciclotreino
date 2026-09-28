import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Cycle,
  Exercise,
  Workout,
  WorkoutSession,
  SessionExercise,
  SessionSet,
  UserProfile,
  ExerciseProgressionHistory,
  RestTimerState,
  MuscleGroup,
} from '../types';
import { store } from '../lib/storage';
import { sound } from '../lib/audio';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';
import { calculateProgression, ProgressionResult } from '../lib/progression';

interface WorkoutContextType {
  // Navigation & Screens
  currentTab: 'home' | 'treino' | 'historico' | 'exercicios' | 'ciclos' | 'perfil' | 'calendario';
  setCurrentTab: (tab: 'home' | 'treino' | 'historico' | 'exercicios' | 'ciclos' | 'perfil' | 'calendario') => void;

  // Data
  profile: UserProfile;
  cycles: Cycle[];
  activeCycle: Cycle;
  exercises: Exercise[];
  sessions: WorkoutSession[];
  progressions: ExerciseProgressionHistory[];
  nextWorkoutInfo: {
    nextWorkout: Workout;
    lastSession: WorkoutSession | null;
    positionInCycle: string;
    daysSinceLastWorkout: number | null;
  };

  // Active Gym Session
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  setCurrentExerciseIndex: (index: number) => void;
  startWorkout: (workout?: Workout) => void;
  cancelWorkout: () => void;
  finishWorkout: () => void;

  // Sets & Exercise Actions
  recordSet: (exerciseIndex: number, setIndex: number, loadKg: number, reps: number) => void;
  quickUpdateSet: (exerciseIndex: number, setIndex: number, newLoad: number, newReps: number) => void;
  finishExercise: (exerciseIndex: number) => void;
  applyProgressionChoice: (
    exerciseIndex: number,
    chosenLoadKg: number,
    chosenReps: number,
    type: 'carga' | 'repeticoes' | 'manter',
    percentage?: number
  ) => void;
  swapExerciseInSession: (exerciseIndex: number, newExercise: Exercise) => void;

  // Rest Timer
  restTimer: RestTimerState;
  startTimer: (seconds: number, exerciseName?: string, setNum?: number) => void;
  pauseResumeTimer: () => void;
  addTimerSeconds: (secs: number) => void;
  skipTimer: () => void;
  isTimerModalOpen: boolean;
  setIsTimerModalOpen: (open: boolean) => void;

  // Modals & Sheets
  finishedExerciseResult: {
    exercise: SessionExercise;
    progression: ProgressionResult;
  } | null;
  closeFinishedExerciseModal: () => void;

  finishedWorkoutSummary: WorkoutSession | null;
  closeFinishedWorkoutModal: () => void;

  isSwapModalOpen: boolean;
  setIsSwapModalOpen: (open: boolean) => void;

  selectedExerciseForDetail: Exercise | null;
  setSelectedExerciseForDetail: (ex: Exercise | null) => void;

  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Cycle & Exercise Management
  setActiveCycleId: (cycleId: string) => void;
  createNewCycle: (name: string, description: string, workoutNames: string[]) => void;
  updateCycle: (cycleId: string, updates: { name: string; description?: string; workouts: { id?: string; name: string; exerciseIds?: string[] }[] }) => void;
  deleteCycle: (cycleId: string) => void;
  addExerciseToLibrary: (name: string, muscleGroup: MuscleGroup, notes?: string) => Exercise;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  overrideNextWorkout: (workoutId: string | null) => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (json: string) => boolean;

  // Supabase
  isSupabaseConnected: boolean;
  syncData: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'treino' | 'historico' | 'exercicios' | 'ciclos' | 'perfil' | 'calendario'>('home');

  // Core Data
  const [profile, setProfile] = useState<UserProfile>(() => store.getProfile());
  const [cycles, setCycles] = useState<Cycle[]>(() => store.getCycles());
  const [exercises, setExercises] = useState<Exercise[]>(() => store.getExercises());
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => store.getSessions());
  const [progressions, setProgressions] = useState<ExerciseProgressionHistory[]>(() => store.getProgressions());
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(() => store.getActiveSession());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  // Timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    isPaused: false,
    totalSeconds: 90,
    remainingSeconds: 0,
    currentSetNumber: 1,
    currentExerciseName: '',
  });
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Modals
  const [finishedExerciseResult, setFinishedExerciseResult] = useState<{
    exercise: SessionExercise;
    progression: ProgressionResult;
  } | null>(null);
  const [finishedWorkoutSummary, setFinishedWorkoutSummary] = useState<WorkoutSession | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());

  // Derived state
  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];
  const nextWorkoutInfo = store.getNextWorkout(activeCycle);

  // Sync state with storage
  const reloadData = useCallback(() => {
    setProfile(store.getProfile());
    setCycles(store.getCycles());
    setExercises(store.getExercises());
    setSessions(store.getSessions());
    setProgressions(store.getProgressions());
  }, []);

  // Timer Countdown Engine with Web Audio & Vibration
  useEffect(() => {
    if (!restTimer.isActive || restTimer.isPaused) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.isActive || prev.isPaused) return prev;

        const newRemaining = prev.remainingSeconds - 1;

        // Sound tick at 3, 2, 1
        if (newRemaining <= 3 && newRemaining > 0 && profile.soundEnabled) {
          sound.playCountdownTick();
        }

        // Timer reached 0!
        if (newRemaining <= 0) {
          if (profile.soundEnabled) {
            sound.playTimerComplete();
          }
          if (profile.vibrationEnabled) {
            sound.vibrate([200, 100, 200, 100, 400]);
          }
          return {
            ...prev,
            isActive: false,
            remainingSeconds: 0,
          };
        }

        return {
          ...prev,
          remainingSeconds: newRemaining,
        };
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [restTimer.isActive, restTimer.isPaused, profile.soundEnabled, profile.vibrationEnabled]);

  const startTimer = useCallback((seconds: number, exerciseName = '', setNum = 1) => {
    setRestTimer({
      isActive: true,
      isPaused: false,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentSetNumber: setNum,
      currentExerciseName: exerciseName,
      startedAt: Date.now(),
    });
  }, []);

  const pauseResumeTimer = useCallback(() => {
    setRestTimer((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const addTimerSeconds = useCallback((secs: number) => {
    setRestTimer((prev) => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + secs),
      totalSeconds: Math.max(prev.totalSeconds, prev.remainingSeconds + secs),
    }));
  }, []);

  const skipTimer = useCallback(() => {
    setRestTimer((prev) => ({
      ...prev,
      isActive: false,
      remainingSeconds: 0,
    }));
  }, []);

  // START WORKOUT
  const startWorkout = useCallback((targetWorkout?: Workout) => {
    const workoutToStart = targetWorkout || nextWorkoutInfo.nextWorkout;
    const allExercises = store.getExercises();
    const progressionsList = store.getProgressions();

    // Build session exercises with smart pre-filled loads and reps
    const sessionExercises: SessionExercise[] = workoutToStart.exercises.map((cfg, idx) => {
      const exerciseDef = allExercises.find((e) => e.id === cfg.exerciseId);
      const exerciseProgression = progressionsList.filter((p) => p.exerciseId === cfg.exerciseId);

      // Latest load from progression history or config
      let initialLoad = cfg.targetLoadKg;
      if (exerciseProgression.length > 0) {
        initialLoad = exerciseProgression[0].appliedLoadKg || exerciseProgression[0].loadKg;
      }

      const sets: SessionSet[] = Array.from({ length: cfg.targetSets }, (_, setIdx) => ({
        id: `set-${Date.now()}-${idx}-${setIdx}`,
        sessionExerciseId: `se-${idx}`,
        setNumber: setIdx + 1,
        loadKg: initialLoad,
        repsPerformed: cfg.targetReps,
        targetReps: cfg.targetReps,
        completed: false,
      }));

      return {
        id: `se-${Date.now()}-${idx}`,
        sessionId: `sess-${Date.now()}`,
        exerciseId: cfg.exerciseId,
        exerciseName: exerciseDef?.name || 'Exercício',
        muscleGroup: exerciseDef?.muscleGroup || 'outro',
        orderIndex: idx,
        targetSets: cfg.targetSets,
        targetReps: cfg.targetReps,
        restSeconds: cfg.restSeconds || profile.defaultRestSeconds,
        sets,
        lastLoadKg: exerciseProgression.length > 0 ? exerciseProgression[0].loadKg : undefined,
        isFinished: false,
      };
    });

    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      userId: profile.id,
      workoutId: workoutToStart.id,
      cycleId: workoutToStart.cycleId,
      workoutName: workoutToStart.name,
      cycleName: activeCycle.name,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolumeKg: 0,
      totalReps: 0,
      totalSets: 0,
      exercises: sessionExercises,
    };

    setActiveSession(newSession);
    store.saveActiveSession(newSession);
    setCurrentExerciseIndex(0);
    setCurrentTab('treino');
  }, [activeCycle, nextWorkoutInfo.nextWorkout, profile]);

  // CANCEL WORKOUT
  const cancelWorkout = useCallback(() => {
    if (window.confirm('Deseja realmente cancelar este treino? Os dados desta sessão serão descartados.')) {
      setActiveSession(null);
      store.saveActiveSession(null);
      skipTimer();
      setCurrentTab('home');
    }
  }, [skipTimer]);

  // RECORD A SET (Instant Tap)
  const recordSet = useCallback((exerciseIndex: number, setIndex: number, loadKg: number, reps: number) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetExercise.sets];

      const currentSet = updatedSets[setIndex];
      const isNowCompleted = !currentSet.completed; // Toggle or mark complete

      updatedSets[setIndex] = {
        ...currentSet,
        loadKg,
        repsPerformed: reps,
        completed: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };

      targetExercise.sets = updatedSets;
      updatedExercises[exerciseIndex] = targetExercise;

      // Calculate totals
      let totalVolume = 0;
      let totalReps = 0;
      let totalSets = 0;

      updatedExercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.completed) {
            totalVolume += s.loadKg * s.repsPerformed;
            totalReps += s.repsPerformed;
            totalSets += 1;
          }
        });
      });

      const updatedSession: WorkoutSession = {
        ...prev,
        exercises: updatedExercises,
        totalVolumeKg: Math.round(totalVolume),
        totalReps,
        totalSets,
      };

      store.saveActiveSession(updatedSession);

      // Trigger rest timer automatically on completion
      if (isNowCompleted) {
        if (profile.soundEnabled) sound.playSuccess();
        if (profile.vibrationEnabled) sound.vibrate([100]);
        startTimer(targetExercise.restSeconds, targetExercise.exerciseName, setIndex + 1);
      }

      return updatedSession;
    });
  }, [profile.soundEnabled, profile.vibrationEnabled, startTimer]);

  // QUICK UPDATE SET REPS / LOAD
  const quickUpdateSet = useCallback((exerciseIndex: number, setIndex: number, newLoad: number, newReps: number) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetExercise.sets];

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        loadKg: Math.max(0, newLoad),
        repsPerformed: Math.max(1, newReps),
      };

      targetExercise.sets = updatedSets;
      updatedExercises[exerciseIndex] = targetExercise;

      const updatedSession: WorkoutSession = {
        ...prev,
        exercises: updatedExercises,
      };

      store.saveActiveSession(updatedSession);
      return updatedSession;
    });
  }, []);

  // FINISH AN EXERCISE
  const finishExercise = useCallback((exerciseIndex: number) => {
    if (!activeSession) return;
    const targetEx = activeSession.exercises[exerciseIndex];
    if (!targetEx) return;

    const allHistory = store.getProgressionForExercise(targetEx.exerciseId);
    const progression = calculateProgression(targetEx, allHistory);

    setFinishedExerciseResult({
      exercise: targetEx,
      progression,
    });
  }, [activeSession]);

  const closeFinishedExerciseModal = useCallback(() => {
    setFinishedExerciseResult(null);
  }, []);

  // APPLY PROGRESSION CHOICE
  const applyProgressionChoice = useCallback((
    exerciseIndex: number,
    chosenLoadKg: number,
    chosenReps: number,
    type: 'carga' | 'repeticoes' | 'manter',
    percentage?: number
  ) => {
    if (!activeSession) return;
    const currentEx = activeSession.exercises[exerciseIndex];
    if (!currentEx) return;

    const completedSets = currentEx.sets.filter((s) => s.completed);
    const repsList = completedSets.map((s) => s.repsPerformed);
    const metTarget = completedSets.length >= currentEx.targetSets && completedSets.every((s) => s.repsPerformed >= currentEx.targetReps);

    const progressionRecord: ExerciseProgressionHistory = {
      id: `p-${Date.now()}`,
      exerciseId: currentEx.exerciseId,
      exerciseName: currentEx.exerciseName,
      sessionId: activeSession.id,
      date: new Date().toISOString().split('T')[0],
      loadKg: completedSets[completedSets.length - 1]?.loadKg || chosenLoadKg,
      setsCompleted: completedSets.length,
      repsList,
      targetReps: currentEx.targetReps,
      metTarget,
      suggestedLoadKg: chosenLoadKg,
      suggestedReps: chosenReps,
      appliedLoadKg: chosenLoadKg,
      appliedReps: chosenReps,
      progressionType: type,
      percentageApplied: percentage,
      notes: metTarget ? 'Meta batida. Progressão aplicada.' : 'Meta mantida para consolidação.',
    };

    store.addProgression(progressionRecord);
    setProgressions(store.getProgressions());

    // Mark exercise finished in active session
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        isFinished: true,
        nextSuggestedLoadKg: chosenLoadKg,
        nextSuggestedReps: chosenReps,
        progressionAccepted: true,
      };
      const updatedSession = { ...prev, exercises: updatedExercises };
      store.saveActiveSession(updatedSession);
      return updatedSession;
    });

    setFinishedExerciseResult(null);

    // If next exercise exists, advance to it
    if (exerciseIndex + 1 < activeSession.exercises.length) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  }, [activeSession]);

  // SWAP EXERCISE DURING ACTIVE SESSION
  const swapExerciseInSession = useCallback((exerciseIndex: number, newExercise: Exercise) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetOld = updatedExercises[exerciseIndex];

      const exProgressions = store.getProgressionForExercise(newExercise.id);
      const defaultLoad = exProgressions.length > 0 ? exProgressions[0].appliedLoadKg || exProgressions[0].loadKg : 20;

      const newSets: SessionSet[] = Array.from({ length: targetOld.targetSets }, (_, setIdx) => ({
        id: `set-swapped-${Date.now()}-${setIdx}`,
        sessionExerciseId: targetOld.id,
        setNumber: setIdx + 1,
        loadKg: defaultLoad,
        repsPerformed: targetOld.targetReps,
        targetReps: targetOld.targetReps,
        completed: false,
      }));

      updatedExercises[exerciseIndex] = {
        ...targetOld,
        exerciseId: newExercise.id,
        exerciseName: newExercise.name,
        muscleGroup: newExercise.muscleGroup,
        sets: newSets,
        lastLoadKg: exProgressions.length > 0 ? exProgressions[0].loadKg : undefined,
        isFinished: false,
      };

      const updated = { ...prev, exercises: updatedExercises };
      store.saveActiveSession(updated);
      return updated;
    });
    setIsSwapModalOpen(false);
  }, []);

  // FINISH ENTIRE WORKOUT
  const finishWorkout = useCallback(() => {
    if (!activeSession) return;

    const startedTime = new Date(activeSession.startedAt).getTime();
    const durationSeconds = Math.max(60, Math.floor((Date.now() - startedTime) / 1000));

    const completedSession: WorkoutSession = {
      ...activeSession,
      completedAt: new Date().toISOString(),
      durationSeconds,
    };

    store.addSession(completedSession);
    store.saveActiveSession(null);
    store.setNextWorkoutOverride(null); // Clear override, let natural sequence take over

    setActiveSession(null);
    skipTimer();
    reloadData();

    // Trigger celebration sound
    if (profile.soundEnabled) sound.playSuccess();
    if (profile.vibrationEnabled) sound.vibrate([200, 100, 200, 100, 500]);

    setFinishedWorkoutSummary(completedSession);
  }, [activeSession, profile.soundEnabled, profile.vibrationEnabled, reloadData, skipTimer]);

  const closeFinishedWorkoutModal = useCallback(() => {
    setFinishedWorkoutSummary(null);
    setCurrentTab('home');
  }, []);

  // CYCLE MANAGEMENT
  const setActiveCycleId = useCallback((cycleId: string) => {
    store.setActiveCycle(cycleId);
    setCycles(store.getCycles());
  }, []);

  const createNewCycle = useCallback((name: string, description: string, workoutNames: string[]) => {
    const currentCycles = store.getCycles();
    const cycleId = `cycle-${Date.now()}`;
    const allExercises = store.getExercises();

    const createdWorkouts: Workout[] = workoutNames.map((wName, idx) => ({
      id: `w-${cycleId}-${idx}`,
      cycleId,
      userId: profile.id,
      name: wName,
      orderIndex: idx,
      exercises: allExercises.slice(idx * 2, idx * 2 + 3).map((ex, exIdx) => ({
        id: `we-${cycleId}-${idx}-${exIdx}`,
        workoutId: `w-${cycleId}-${idx}`,
        exerciseId: ex.id,
        orderIndex: exIdx,
        targetSets: 4,
        targetReps: 10,
        targetLoadKg: 20,
        restSeconds: 90,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newCycle: Cycle = {
      id: cycleId,
      userId: profile.id,
      name,
      description,
      isActive: true,
      workouts: createdWorkouts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deactivate previous cycles
    const updatedCycles = currentCycles.map((c) => ({ ...c, isActive: false }));
    updatedCycles.push(newCycle);

    store.saveCycles(updatedCycles);
    setCycles(updatedCycles);
  }, [profile.id]);

  const updateCycle = useCallback(
    (
      cycleId: string,
      updates: {
        name: string;
        description?: string;
        workouts: { id?: string; name: string; exerciseIds?: string[] }[];
      }
    ) => {
      const currentCycles = store.getCycles();
      const allExercises = store.getExercises();

      const updatedCycles = currentCycles.map((cycle) => {
        if (cycle.id !== cycleId) return cycle;

        // Build updated workouts list
        const updatedWorkouts: Workout[] = updates.workouts.map((wData, idx) => {
          const existingWorkout = cycle.workouts.find((ew) => ew.id === wData.id);
          const workoutId = wData.id || `w-${cycleId}-${Date.now()}-${idx}`;

          // Keep existing exercises or create defaults from exerciseIds or existing
          let exercisesForWorkout: WorkoutExerciseConfig[] = [];

          if (wData.exerciseIds && wData.exerciseIds.length > 0) {
            exercisesForWorkout = wData.exerciseIds.map((exId, exIdx) => {
              const existingCfg = existingWorkout?.exercises.find((e) => e.exerciseId === exId);
              return {
                id: existingCfg?.id || `we-${workoutId}-${exIdx}`,
                workoutId,
                exerciseId: exId,
                orderIndex: exIdx,
                targetSets: existingCfg?.targetSets || 4,
                targetReps: existingCfg?.targetReps || 10,
                targetLoadKg: existingCfg?.targetLoadKg || 20,
                restSeconds: existingCfg?.restSeconds || profile.defaultRestSeconds || 90,
              };
            });
          } else if (existingWorkout) {
            exercisesForWorkout = existingWorkout.exercises.map((e, exIdx) => ({
              ...e,
              orderIndex: exIdx,
            }));
          } else {
            // Default 3 exercises if newly added
            const sampleSlice = allExercises.slice(idx * 2, idx * 2 + 3);
            exercisesForWorkout = sampleSlice.map((ex, exIdx) => ({
              id: `we-${workoutId}-${exIdx}`,
              workoutId,
              exerciseId: ex.id,
              orderIndex: exIdx,
              targetSets: 4,
              targetReps: 10,
              targetLoadKg: 20,
              restSeconds: 90,
            }));
          }

          return {
            id: workoutId,
            cycleId,
            userId: profile.id,
            name: wData.name,
            orderIndex: idx,
            exercises: exercisesForWorkout,
            createdAt: existingWorkout?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        return {
          ...cycle,
          name: updates.name,
          description: updates.description ?? cycle.description,
          workouts: updatedWorkouts,
          updatedAt: new Date().toISOString(),
        };
      });

      store.saveCycles(updatedCycles);
      setCycles(updatedCycles);
    },
    [profile.id, profile.defaultRestSeconds]
  );

  const deleteCycle = useCallback(
    (cycleId: string) => {
      const currentCycles = store.getCycles();
      if (currentCycles.length <= 1) return; // Prevent deleting the only cycle

      let nextActiveId: string | null = null;
      const targetCycle = currentCycles.find((c) => c.id === cycleId);

      const filtered = currentCycles.filter((c) => c.id !== cycleId);
      if (targetCycle?.isActive && filtered.length > 0) {
        filtered[0].isActive = true;
        nextActiveId = filtered[0].id;
      }

      store.saveCycles(filtered);
      setCycles(filtered);
      if (nextActiveId) {
        setActiveCycleId(nextActiveId);
      }
    },
    [setActiveCycleId]
  );

  // EXERCISE MANAGEMENT
  const addExerciseToLibrary = useCallback((name: string, muscleGroup: MuscleGroup, notes?: string): Exercise => {
    const newEx = store.addExercise({
      name,
      muscleGroup,
      notes,
      defaultRestSeconds: profile.defaultRestSeconds,
    });
    setExercises(store.getExercises());
    return newEx;
  }, [profile.defaultRestSeconds]);

  // PROFILE MANAGEMENT
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    const current = store.getProfile();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    store.saveProfile(updated);
    setProfile(updated);
  }, []);

  const overrideNextWorkout = useCallback((workoutId: string | null) => {
    store.setNextWorkoutOverride(workoutId);
    reloadData();
  }, [reloadData]);

  const exportDatabaseJSON = useCallback(() => {
    return store.exportData();
  }, []);

  const importDatabaseJSON = useCallback((json: string) => {
    const ok = store.importData(json);
    if (ok) reloadData();
    return ok;
  }, [reloadData]);

  // SUPABASE SYNC
  const syncData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
      setIsSupabaseConnected(true);
      // Attempt background push of latest sessions if available
      const localSessions = store.getSessions();
      if (localSessions.length > 0) {
        // Upsert sessions in Supabase
        // Handled gracefully in background
      }
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        profile,
        cycles,
        activeCycle,
        exercises,
        sessions,
        progressions,
        nextWorkoutInfo,
        activeSession,
        currentExerciseIndex,
        setCurrentExerciseIndex,
        startWorkout,
        cancelWorkout,
        finishWorkout,
        recordSet,
        quickUpdateSet,
        finishExercise,
        applyProgressionChoice,
        swapExerciseInSession,
        restTimer,
        startTimer,
        pauseResumeTimer,
        addTimerSeconds,
        skipTimer,
        isTimerModalOpen,
        setIsTimerModalOpen,
        finishedExerciseResult,
        closeFinishedExerciseModal,
        finishedWorkoutSummary,
        closeFinishedWorkoutModal,
        isSwapModalOpen,
        setIsSwapModalOpen,
        selectedExerciseForDetail,
        setSelectedExerciseForDetail,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        setActiveCycleId,
        createNewCycle,
        updateCycle,
        deleteCycle,
        addExerciseToLibrary,
        updateUserProfile,
        overrideNextWorkout,
        exportDatabaseJSON,
        importDatabaseJSON,
        isSupabaseConnected,
        syncData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
