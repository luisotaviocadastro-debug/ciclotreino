import { SessionExercise, ExerciseProgressionHistory } from '../types';

export interface ProgressionResult {
  hasHistory: boolean;
  status: 'first_record' | 'target_met' | 'target_missed' | 'maintained';
  summaryTitle: string;
  summaryDescription: string;
  lastLoadKg: number;
  lastRepsSummary: string;
  isTargetMet: boolean;
  suggestedLoadKg: number;
  suggestedReps: number;
  suggestedType: 'carga' | 'repeticoes' | 'manter';
  suggestedPercent: number;
  // Quick pre-calculated options for user selection
  options: {
    plus5: number;
    plus10: number;
    plus15: number;
    plus20: number;
    plusOneRep: number;
    keepLoad: number;
  };
}

/**
 * Rounds load to realistic gym increments (0.5 kg)
 */
export function roundToGymPlate(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Calculates progression for an exercise based on historical executions and current session sets
 */
export function calculateProgression(
  exercise: SessionExercise,
  history: ExerciseProgressionHistory[]
): ProgressionResult {
  const completedSets = exercise.sets.filter((s) => s.completed);
  
  if (completedSets.length === 0) {
    const fallbackLoad = exercise.lastLoadKg || 20;
    return {
      hasHistory: history.length > 0,
      status: history.length === 0 ? 'first_record' : 'maintained',
      summaryTitle: 'Nenhuma série concluída',
      summaryDescription: 'Execute ao menos uma série para calcular a progressão.',
      lastLoadKg: fallbackLoad,
      lastRepsSummary: '-',
      isTargetMet: false,
      suggestedLoadKg: fallbackLoad,
      suggestedReps: exercise.targetReps,
      suggestedType: 'manter',
      suggestedPercent: 0,
      options: {
        plus5: roundToGymPlate(fallbackLoad * 1.05),
        plus10: roundToGymPlate(fallbackLoad * 1.10),
        plus15: roundToGymPlate(fallbackLoad * 1.15),
        plus20: roundToGymPlate(fallbackLoad * 1.20),
        plusOneRep: exercise.targetReps + 1,
        keepLoad: fallbackLoad,
      },
    };
  }

  // Determine current workout load & reps summary
  const lastLoad = completedSets[completedSets.length - 1].loadKg;
  const repsArray = completedSets.map((s) => s.repsPerformed);
  const repsSummary = repsArray.join(' / ');

  // Rule: Check if target reps were completed on ALL target sets
  // If target is 4x10, user needs at least 4 sets and every set >= 10
  const metSetCount = completedSets.length >= exercise.targetSets;
  const metAllReps = completedSets.every((s) => s.repsPerformed >= exercise.targetReps);
  const isTargetMet = metSetCount && metAllReps;

  // Options based on current load
  const options = {
    plus5: roundToGymPlate(lastLoad * 1.05),
    plus10: roundToGymPlate(lastLoad * 1.10),
    plus15: roundToGymPlate(lastLoad * 1.15),
    plus20: roundToGymPlate(lastLoad * 1.20),
    plusOneRep: exercise.targetReps + 1,
    keepLoad: lastLoad,
  };

  // Rule 1: No previous history exists (First time doing this exercise)
  if (history.length === 0) {
    return {
      hasHistory: false,
      status: 'first_record',
      summaryTitle: 'Primeiro registro deste exercício',
      summaryDescription: `Desempenho base registrado com sucesso (${lastLoad} kg • ${repsSummary}). A partir do próximo ciclo você receberá sugestões inteligentes baseadas em sua evolução real.`,
      lastLoadKg: lastLoad,
      lastRepsSummary: repsSummary,
      isTargetMet,
      suggestedLoadKg: isTargetMet ? options.plus10 : lastLoad,
      suggestedReps: exercise.targetReps,
      suggestedType: isTargetMet ? 'carga' : 'manter',
      suggestedPercent: isTargetMet ? 10 : 0,
      options,
    };
  }

  // Rule 2: Target Met with flying colors!
  if (isTargetMet) {
    const suggestedLoad = options.plus10;
    return {
      hasHistory: true,
      status: 'target_met',
      summaryTitle: 'Meta batida! Parabéns 🔥',
      summaryDescription: `Você completou todas as ${exercise.targetSets} séries com ${exercise.targetReps}+ reps. Sugestão: aumentar carga em +10% (${suggestedLoad} kg).`,
      lastLoadKg: lastLoad,
      lastRepsSummary: repsSummary,
      isTargetMet: true,
      suggestedLoadKg: suggestedLoad,
      suggestedReps: exercise.targetReps,
      suggestedType: 'carga',
      suggestedPercent: 10,
      options,
    };
  }

  // Rule 3: Target NOT met
  // "Quando o usuário não bate a meta (ex: 10/8/7): O app não deve sugerir automaticamente aumento.
  // Registrar: Meta não concluída. Sugestão: Repetir carga e tentar completar a meta."
  return {
    hasHistory: true,
    status: 'target_missed',
    summaryTitle: 'Meta em consolidação 🎯',
    summaryDescription: `Você realizou ${repsSummary} (meta: ${exercise.targetSets}×${exercise.targetReps}). Sugestão: Manter ${lastLoad} kg no próximo treino até bater a meta de repetições.`,
    lastLoadKg: lastLoad,
    lastRepsSummary: repsSummary,
    isTargetMet: false,
    suggestedLoadKg: lastLoad,
    suggestedReps: exercise.targetReps,
    suggestedType: 'manter',
    suggestedPercent: 0,
    options,
  };
}
