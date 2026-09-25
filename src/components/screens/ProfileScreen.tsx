import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import {
  User,
  Settings,
  Database,
  Volume2,
  Smartphone,
  Download,
  Upload,
  Check,
  Timer,
  TrendingUp,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    updateUserProfile,
    setIsSupabaseModalOpen,
    setIsAuthModalOpen,
    isSupabaseConnected,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useWorkout();

  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '');
  const [goal, setGoal] = useState(profile.goal || 'hipertrofia');
  const [defaultRest, setDefaultRest] = useState(profile.defaultRestSeconds.toString());
  const [defaultProgPercent, setDefaultProgPercent] = useState(profile.defaultProgressionPercent.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'Atleta',
      weightKg: weight ? parseFloat(weight) : undefined,
      goal: goal as any,
      defaultRestSeconds: parseInt(defaultRest) || 90,
      defaultProgressionPercent: parseFloat(defaultProgPercent) || 10,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciclotreino_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJSON(content);
        if (ok) {
          alert('Backup importado com sucesso!');
        } else {
          alert('Erro ao importar backup. Arquivo JSON inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <User className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{profile.name}</h2>
            <span className="text-xs text-slate-400">{profile.email}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {profile.goal}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-bold"
        >
          Conta
        </button>
      </div>

      {/* Supabase Integration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white">Banco de Dados Supabase</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isSupabaseConnected ? 'Conectado' : 'Modo Offline Ativo'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Obtenha o SQL completo e conecte seu backend
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
        >
          Configurar
        </button>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Settings className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Preferências do Treino</h3>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Seu Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Peso Corporal (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 78.5"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Objetivo
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="hipertrofia">Hipertrofia</option>
              <option value="forca">Força</option>
              <option value="resistencia">Resistência</option>
              <option value="emagrecimento">Emagrecimento</option>
              <option value="saude">Saúde Geral</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
              <Timer className="w-3 h-3 text-slate-400" />
              Descanso Padrão (s)
            </label>
            <input
              type="number"
              step="5"
              value={defaultRest}
              onChange={(e) => setDefaultRest(e.target.value)}
              placeholder="90"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              Sugestão de Carga (%)
            </label>
            <input
              type="number"
              step="1"
              value={defaultProgPercent}
              onChange={(e) => setDefaultProgPercent(e.target.value)}
              placeholder="10"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Feedback Toggles */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Sons e alertas sonoros do cronômetro
            </span>
            <input
              type="checkbox"
              checked={profile.soundEnabled}
              onChange={(e) => updateUserProfile({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Vibração tátil no fim da série
            </span>
            <input
              type="checkbox"
              checked={profile.vibrationEnabled}
              onChange={(e) => updateUserProfile({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-98 transition"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Salvo com sucesso!</span>
            </>
          ) : (
            <span>Salvar Alterações</span>
          )}
        </button>
      </form>

      {/* Backup and Data Resiliency Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Segurança dos Seus Dados de Treino
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Nenhum treino seu é perdido. Você pode exportar uma cópia completa dos seus ciclos, exercícios e histórico a qualquer momento.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup</span>
          </button>

          <label className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
