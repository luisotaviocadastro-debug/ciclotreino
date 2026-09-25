import React from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { TimerBar } from './components/common/TimerBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { ActiveWorkoutScreen } from './components/screens/ActiveWorkoutScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { ExerciseListScreen } from './components/screens/ExerciseListScreen';
import { CyclesScreen } from './components/screens/CyclesScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { ExerciseFinishedModal } from './components/screens/ExerciseFinishedModal';
import { WorkoutFinishedModal } from './components/screens/WorkoutFinishedModal';
import { SwapExerciseModal } from './components/screens/SwapExerciseModal';
import { SupabaseSetupModal } from './components/screens/SupabaseSetupModal';
import { AuthModal } from './components/screens/AuthModal';

const MainContent: React.FC = () => {
  const { currentTab } = useWorkout();

  return (
    <main className="max-w-md mx-auto px-4 pt-3">
      {currentTab === 'home' && <HomeScreen />}
      {currentTab === 'treino' && <ActiveWorkoutScreen />}
      {currentTab === 'historico' && <HistoryScreen />}
      {currentTab === 'exercicios' && <ExerciseListScreen />}
      {currentTab === 'ciclos' && <CyclesScreen />}
      {currentTab === 'perfil' && <ProfileScreen />}
      {currentTab === 'calendario' && <CalendarScreen />}
    </main>
  );
};

export default function App() {
  return (
    <WorkoutProvider>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none touch-manipulation">
        {/* Mobile App Header */}
        <Header />

        {/* Dynamic Screen Viewport */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Global Floating Rest Timer Pill & Modal */}
        <TimerBar />

        {/* Modals & Dialogs */}
        <ExerciseFinishedModal />
        <WorkoutFinishedModal />
        <SwapExerciseModal />
        <SupabaseSetupModal />
        <AuthModal />

        {/* Ergonomic Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </WorkoutProvider>
  );
}
