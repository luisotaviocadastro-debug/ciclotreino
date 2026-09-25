import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';
import { Dumbbell, X, Mail, Lock, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, profile, updateUserProfile, setIsSupabaseModalOpen } = useWorkout();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const client = getSupabaseClient();

    if (!client || !isSupabaseConfigured()) {
      // Local Mode handling
      if (mode === 'signup' || mode === 'login') {
        updateUserProfile({
          email: email.trim(),
          name: name.trim() || profile.name || 'Atleta',
        });
        setFeedback({
          type: 'success',
          message: 'Conta local ativada com sucesso! Você pode conectar o Supabase nas configurações.',
        });
        setTimeout(() => setIsAuthModalOpen(false), 1200);
      } else {
        setFeedback({
          type: 'success',
          message: 'Instruções de recuperação simuladas localmente.',
        });
      }
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (data.user) {
          updateUserProfile({
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'Atleta',
          });
          setFeedback({ type: 'success', message: 'Login realizado com sucesso!' });
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        }
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim() || 'Atleta',
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          updateUserProfile({
            id: data.user.id,
            email: data.user.email || email,
            name: name.trim() || 'Atleta',
          });
          setFeedback({
            type: 'success',
            message: 'Conta criada! Verifique seu e-mail de confirmação ou faça login.',
          });
          setTimeout(() => setIsAuthModalOpen(false), 1500);
        }
      } else {
        const { error } = await client.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        setFeedback({
          type: 'success',
          message: 'E-mail de recuperação enviado com sucesso!',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-sm text-white">CICLOTREINO</span>
          </div>
        </div>

        <h2 className="text-xl font-black text-white">
          {mode === 'login' && 'Entrar na Conta'}
          {mode === 'signup' && 'Criar Minha Conta'}
          {mode === 'forgot' && 'Recuperar Senha'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {mode === 'login' && 'Seu treino. Sua evolução contínua.'}
          {mode === 'signup' && 'Cadastre-se para sincronizar seus ciclos.'}
          {mode === 'forgot' && 'Informe seu e-mail para redefinir o acesso.'}
        </p>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Seu Nome</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do Atleta"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-98 transition disabled:opacity-50"
          >
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Enviar E-mail'}
          </button>
        </form>

        {/* Mode switch links */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center space-y-2 text-xs">
          {mode === 'login' ? (
            <>
              <button
                onClick={() => {
                  setMode('signup');
                  setFeedback(null);
                }}
                className="text-emerald-400 hover:underline font-bold block mx-auto"
              >
                Não tem conta? Criar minha conta
              </button>
              <button
                onClick={() => {
                  setMode('forgot');
                  setFeedback(null);
                }}
                className="text-slate-400 hover:text-white block mx-auto text-[11px]"
              >
                Esqueci minha senha
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setFeedback(null);
              }}
              className="text-emerald-400 hover:underline font-bold block mx-auto"
            >
              Já possui conta? Fazer Login
            </button>
          )}

          {/* Quick Supabase config trigger */}
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setIsSupabaseModalOpen(true);
            }}
            className="text-[11px] text-slate-500 hover:text-slate-300 block mx-auto pt-1"
          >
            Configurações de Conexão Supabase
          </button>
        </div>
      </div>
    </div>
  );
};
