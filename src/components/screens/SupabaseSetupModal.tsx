import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  clearSupabaseCredentials,
} from '../../lib/supabase';
import { SUPABASE_SQL_SCRIPT } from '../../lib/supabaseSql';
import {
  Database,
  X,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const SupabaseSetupModal: React.FC = () => {
  const { isSupabaseModalOpen, setIsSupabaseModalOpen, syncData } = useWorkout();

  const credentials = getSupabaseCredentials();
  const [url, setUrl] = useState(credentials.url);
  const [anonKey, setAnonKey] = useState(credentials.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'conexao' | 'sql'>('conexao');

  React.useEffect(() => {
    if (isSupabaseModalOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
    }
  }, [isSupabaseModalOpen]);

  if (!isSupabaseModalOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      saveSupabaseCredentials(url.trim(), anonKey.trim());
      syncData();
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult({ success: true, message: 'Supabase desconectado. Aplicativo operando em modo Local/Offline.' });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Integração Supabase</h3>
              <span className="text-[11px] text-slate-400">PostgreSQL + RLS + Autenticação</span>
            </div>
          </div>
          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center my-3">
          <button
            onClick={() => setActiveTab('conexao')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'conexao'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Conexão & Credenciais
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Script SQL Completo</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {activeTab === 'conexao' ? (
            <>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-0.5">Modo Híbrido Resiliente:</span>
                O aplicativo foi construído para funcionar perfeitamente com ou sem internet. Ao inserir suas credenciais do Supabase, seus dados passam a sincronizar na nuvem com PostgreSQL.
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Supabase Project URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Supabase Anon / Public Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  {url && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="py-3 px-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold transition"
                    >
                      Desconectar
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isTesting}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-wide shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
                  >
                    {isTesting ? 'Testando Conexão...' : 'Testar e Salvar Conexão'}
                  </button>
                </div>
              </form>

              {/* Instructions steps */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                <span className="font-bold text-white block">Onde encontrar suas chaves no Supabase:</span>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse o painel do seu projeto no Supabase (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>)</li>
                  <li>Vá em <strong>Project Settings</strong> (ícone de engrenagem) &gt; <strong>API</strong></li>
                  <li>Copie o <strong>Project URL</strong> e a <strong>anon public key</strong></li>
                  <li>Depois de conectar, copie o Script SQL na aba ao lado e execute no <strong>SQL Editor</strong> do Supabase!</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-400">
                  Execute este script no <strong>SQL Editor</strong> do Supabase:
                </span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px] active:scale-95 transition"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono max-h-72 overflow-y-auto leading-relaxed">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-white block">O que este SQL cria:</span>
                <p>✓ 10 Tabelas com integridade referencial e timestamps</p>
                <p>✓ Enums de grupos musculares e tipos de progressão</p>
                <p>✓ Políticas RLS completas (cada usuário acessa somente os seus dados)</p>
                <p>✓ Triggers automáticos para inicializar ciclo e treinos padrão no cadastro</p>
                <p>✓ Índices de alta performance para execução rápida em mobile</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
