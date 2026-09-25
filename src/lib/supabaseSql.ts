export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- CICLOTREINO — ESQUEMA COMPLETO DO BANCO DE DADOS POSTGRESQL / SUPABASE
-- ==============================================================================
-- Instruções:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "New Query"
-- 4. Cole TODO este script abaixo e clique em "Run" (Executar)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS E ENUMS
DO $$ BEGIN
    CREATE TYPE muscle_group_enum AS ENUM (
        'peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 
        'abdomen', 'panturrilha', 'trapezio', 'corpo_todo', 'outro'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE progression_type_enum AS ENUM ('carga', 'repeticoes', 'manter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE PERFIS DE USUÁRIO (profiles)
-- Vinculada automaticamente com a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT NOT NULL DEFAULT 'Atleta',
    birth_date DATE,
    gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')),
    weight_kg NUMERIC(5,2),
    goal TEXT DEFAULT 'hipertrofia',
    default_rest_seconds INTEGER NOT NULL DEFAULT 90,
    default_progression_type progression_type_enum NOT NULL DEFAULT 'carga',
    default_progression_percent NUMERIC(4,1) NOT NULL DEFAULT 10.0,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    vibration_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE CICLOS DE TREINO (cycles)
-- Guarda os ciclos criados pelo usuário (ex: "Ciclo Hipertrofia 4x", "Push Pull Legs")
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE TREINOS DO CICLO (workouts)
-- Guarda os treinos ordenados dentro de um ciclo (Treino 1, Treino 2, Treino 3...)
-- A ordem é estritamente definida por order_index, INDEPENDENTE de dias da semana
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_workout_order_per_cycle UNIQUE (cycle_id, order_index)
);

-- 6. TABELA DE EXERCÍCIOS (exercises)
-- Cada exercício possui histórico próprio e independente
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group muscle_group_enum NOT NULL DEFAULT 'outro',
    default_rest_seconds INTEGER DEFAULT 90,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_exercise_name_per_user UNIQUE (user_id, name)
);

-- 7. TABELA DE CONFIGURAÇÃO DE EXERCÍCIO POR TREINO (workout_exercises)
-- Vincula quais exercícios pertencem a qual treino e suas metas de séries/repetições/carga
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 4 CHECK (target_sets > 0),
    target_reps INTEGER NOT NULL DEFAULT 10 CHECK (target_reps > 0),
    target_load_kg NUMERIC(6,2) NOT NULL DEFAULT 20.0 CHECK (target_load_kg >= 0),
    rest_seconds INTEGER NOT NULL DEFAULT 90 CHECK (rest_seconds > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_exercise_per_workout UNIQUE (workout_id, exercise_id)
);

-- 8. TABELA DE SESSÕES DE TREINO REALIZADAS (workout_sessions)
-- O histórico de execução real no tempo (calendário retrospectivo)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    cycle_id UUID REFERENCES public.cycles(id) ON DELETE SET NULL,
    workout_name TEXT NOT NULL,
    cycle_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    total_volume_kg NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    total_reps INTEGER NOT NULL DEFAULT 0,
    total_sets INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABELA DE EXERCÍCIOS REALIZADOS NA SESSÃO (session_exercises)
CREATE TABLE IF NOT EXISTS public.session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    muscle_group muscle_group_enum NOT NULL DEFAULT 'outro',
    order_index INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 4,
    target_reps INTEGER NOT NULL DEFAULT 10,
    rest_seconds INTEGER NOT NULL DEFAULT 90,
    last_load_kg NUMERIC(6,2),
    next_suggested_load_kg NUMERIC(6,2),
    next_suggested_reps INTEGER,
    progression_note TEXT,
    progression_accepted BOOLEAN DEFAULT true,
    is_finished BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TABELA DE SÉRIES REALIZADAS (session_sets)
-- Registro ágil de cada repetição e carga real
CREATE TABLE IF NOT EXISTS public.session_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_exercise_id UUID NOT NULL REFERENCES public.session_exercises(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    load_kg NUMERIC(6,2) NOT NULL DEFAULT 0.0,
    reps_performed INTEGER NOT NULL DEFAULT 0,
    target_reps INTEGER NOT NULL DEFAULT 10,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    rest_time_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TABELA DE PROGRESSÕES INDIVIDUAIS DO EXERCÍCIO (exercise_progressions)
-- Preserva todo o histórico de decisões e progressões por exercício
CREATE TABLE IF NOT EXISTS public.exercise_progressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    load_kg NUMERIC(6,2) NOT NULL,
    sets_completed INTEGER NOT NULL,
    reps_list INTEGER[] NOT NULL,
    target_reps INTEGER NOT NULL,
    met_target BOOLEAN NOT NULL,
    suggested_load_kg NUMERIC(6,2),
    suggested_reps INTEGER,
    applied_load_kg NUMERIC(6,2),
    applied_reps INTEGER,
    progression_type progression_type_enum NOT NULL DEFAULT 'carga',
    percentage_applied NUMERIC(4,1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TABELA DE ESTADO ATUAL DO USUÁRIO NA SEQUÊNCIA (user_sequence_state)
-- Controla em qual treino da sequência o usuário está agora (Treino 1 -> Treino 2 -> etc.)
CREATE TABLE IF NOT EXISTS public.user_sequence_state (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    active_cycle_id UUID REFERENCES public.cycles(id) ON DELETE SET NULL,
    next_workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    last_completed_workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    last_completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cycles_user_active ON public.cycles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workouts_cycle_order ON public.workouts(cycle_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON public.workout_exercises(workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_user_name ON public.exercises(user_id, name);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON public.session_exercises(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_session_sets_exercise ON public.session_sets(session_exercise_id, set_number);
CREATE INDEX IF NOT EXISTS idx_progressions_exercise_user ON public.exercise_progressions(exercise_id, user_id, date DESC);

-- ==============================================================================
-- 14. FUNÇÕES E TRIGGERS (AUTOMATIZAÇÃO)
-- ==============================================================================

-- Função para atualizar coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cycles_updated_at ON public.cycles;
CREATE TRIGGER set_cycles_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_workouts_updated_at ON public.workouts;
CREATE TRIGGER set_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_exercises_updated_at ON public.exercises;
CREATE TRIGGER set_exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger automático para criar Perfil e Ciclo Padrão no novo cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_cycle_id UUID;
    w1_id UUID;
    w2_id UUID;
    w3_id UUID;
    w4_id UUID;
    ex_supino UUID;
    ex_rosca UUID;
    ex_agachamento UUID;
    ex_leg UUID;
    ex_desenvolvimento UUID;
    ex_triceps UUID;
    ex_puxada UUID;
    ex_remada UUID;
BEGIN
    -- 1. Cria perfil padrão
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Atleta'));

    -- 2. Cria ciclo inicial de 4 treinos
    INSERT INTO public.cycles (id, user_id, name, description, is_active)
    VALUES (gen_random_uuid(), NEW.id, 'Ciclo Principal (4 Treinos)', 'Sequência contínua de hipertrofia', true)
    RETURNING id INTO new_cycle_id;

    -- 3. Cria os 4 treinos na sequência
    INSERT INTO public.workouts (id, cycle_id, user_id, name, order_index)
    VALUES (gen_random_uuid(), new_cycle_id, NEW.id, 'Treino 1 — Peito + Bíceps', 0) RETURNING id INTO w1_id;

    INSERT INTO public.workouts (id, cycle_id, user_id, name, order_index)
    VALUES (gen_random_uuid(), new_cycle_id, NEW.id, 'Treino 2 — Pernas & Panturrilha', 1) RETURNING id INTO w2_id;

    INSERT INTO public.workouts (id, cycle_id, user_id, name, order_index)
    VALUES (gen_random_uuid(), new_cycle_id, NEW.id, 'Treino 3 — Ombros + Tríceps', 2) RETURNING id INTO w3_id;

    INSERT INTO public.workouts (id, cycle_id, user_id, name, order_index)
    VALUES (gen_random_uuid(), new_cycle_id, NEW.id, 'Treino 4 — Costas & Abdômen', 3) RETURNING id INTO w4_id;

    -- 4. Cria exercícios base
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Supino Reto com Barra', 'peito') RETURNING id INTO ex_supino;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Rosca Direta com Barra W', 'biceps') RETURNING id INTO ex_rosca;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Agachamento Livre', 'pernas') RETURNING id INTO ex_agachamento;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Leg Press 45°', 'pernas') RETURNING id INTO ex_leg;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Desenvolvimento com Halteres', 'ombros') RETURNING id INTO ex_desenvolvimento;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Tríceps na Corda (Polia)', 'triceps') RETURNING id INTO ex_triceps;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Puxada Frontal na Polia', 'costas') RETURNING id INTO ex_puxada;
    INSERT INTO public.exercises (id, user_id, name, muscle_group) VALUES (gen_random_uuid(), NEW.id, 'Remada Curvada com Barra', 'costas') RETURNING id INTO ex_remada;

    -- 5. Vincula exercícios aos treinos
    INSERT INTO public.workout_exercises (workout_id, exercise_id, user_id, order_index, target_sets, target_reps, target_load_kg, rest_seconds)
    VALUES 
        (w1_id, ex_supino, NEW.id, 0, 4, 10, 30.0, 90),
        (w1_id, ex_rosca, NEW.id, 1, 3, 10, 16.0, 60),
        (w2_id, ex_agachamento, NEW.id, 0, 4, 8, 40.0, 120),
        (w2_id, ex_leg, NEW.id, 1, 4, 10, 100.0, 90),
        (w3_id, ex_desenvolvimento, NEW.id, 0, 4, 10, 14.0, 90),
        (w3_id, ex_triceps, NEW.id, 1, 3, 10, 25.0, 60),
        (w4_id, ex_puxada, NEW.id, 0, 4, 10, 45.0, 90),
        (w4_id, ex_remada, NEW.id, 1, 4, 10, 35.0, 90);

    -- 6. Define estado inicial: Próximo treino = Treino 1
    INSERT INTO public.user_sequence_state (user_id, active_cycle_id, next_workout_id)
    VALUES (NEW.id, new_cycle_id, w1_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativa o trigger ao criar usuário no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) — SEGURANÇA TOTAL POR USUÁRIO
-- Cada usuário consegue acessar, criar, atualizar e excluir SOMENTE seus dados!
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sequence_state ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: profiles
CREATE POLICY "profiles_user_all" ON public.profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- POLÍTICAS: cycles
CREATE POLICY "cycles_user_all" ON public.cycles
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: workouts
CREATE POLICY "workouts_user_all" ON public.workouts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: exercises
CREATE POLICY "exercises_user_all" ON public.exercises
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: workout_exercises
CREATE POLICY "workout_exercises_user_all" ON public.workout_exercises
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: workout_sessions
CREATE POLICY "workout_sessions_user_all" ON public.workout_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: session_exercises
CREATE POLICY "session_exercises_user_all" ON public.session_exercises
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: session_sets
CREATE POLICY "session_sets_user_all" ON public.session_sets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: exercise_progressions
CREATE POLICY "exercise_progressions_user_all" ON public.exercise_progressions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: user_sequence_state
CREATE POLICY "user_sequence_state_user_all" ON public.user_sequence_state
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FIM DO SCRIPT SQL
`;
