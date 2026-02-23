import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { Loader2, Mail, Lock } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'recovery' | 'updatePassword';

interface AuthPageProps {
  onRecoveryComplete?: () => void;
}

export function AuthPage({ onRecoveryComplete }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Detecta se é um link de recuperação
    if (hash.includes('type=recovery') || searchParams.has('code')) {
      setMode('updatePassword');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('updatePassword');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!captchaToken && mode !== 'updatePassword') {
      setError('Por favor, complete o desafio de segurança.');
      return;
    }

    setLoading(true);

    try {
      let authError = null;

      if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          captchaToken: captchaToken || undefined,
          redirectTo: `${window.location.origin}/`,
        });
        authError = error;
      } 
      else if (mode === 'updatePassword') {
        const { error } = await supabase.auth.updateUser({ password });
        authError = error;
      } 
      else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { captchaToken: captchaToken || undefined },
        });
        authError = error;
      } 
      else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: captchaToken || undefined },
        });
        authError = error;
      }

      if (authError) {
        setError(authError.message);
        turnstileRef.current?.reset();
        setCaptchaToken(null);
      } else {
        if (mode === 'recovery') {
          setMessage('Instruções enviadas para seu e-mail!');
          setEmail('');
        } else if (mode === 'updatePassword') {
          setMessage('Senha atualizada com sucesso!');
          // Avisa o App que a recuperação acabou
          if (onRecoveryComplete) onRecoveryComplete();
          setTimeout(() => {
            window.location.href = '/'; // Limpa a URL e reseta o app
          }, 2000);
        } else if (mode === 'signup') {
          setMessage('Verifique seu e-mail para confirmar o cadastro!');
        } else {
          setMessage('Login bem-sucedido!');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const getTexts = () => {
    if (mode === 'recovery') return { title: 'Recuperar Senha', button: 'Enviar Instruções' };
    if (mode === 'updatePassword') return { title: 'Nova Senha', button: 'Atualizar Senha' };
    if (mode === 'signup') return { title: 'Crie sua conta', button: 'Cadastrar' };
    return { title: 'Acesse sua conta', button: 'Entrar' };
  };

  return (
    <div className="max-w-md mx-auto pt-10 px-4">
      <h1 className="text-3xl font-bold text-center text-white mb-2">GabaritoPadel</h1>
      <p className="text-center text-zinc-400 mb-6">{getTexts().title}</p>
      
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-700/50">
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode !== 'updatePassword' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 pl-10 text-white focus:border-lime-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          )}

          {mode !== 'recovery' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-zinc-400">
                  {mode === 'updatePassword' ? 'Nova Senha' : 'Senha'}
                </label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('recovery')} className="text-xs text-lime-400 hover:underline">
                    Esqueceu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 pl-10 text-white focus:border-lime-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode !== 'updatePassword' && (
            <div className="flex justify-center py-2">
              <Turnstile
                ref={turnstileRef}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: 'dark', size: 'normal' }}
              />
            </div>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">{error}</div>}
          {message && <div className="bg-lime-500/10 border border-lime-500/20 text-lime-400 p-3 rounded-lg text-sm text-center">{message}</div>}

          <button 
            type="submit" 
            disabled={loading || (!captchaToken && mode !== 'updatePassword')}
            className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-zinc-600 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : getTexts().button}
          </button>

          <div className="text-center text-sm text-zinc-400 pt-2">
            {mode === 'login' ? (
              <p>Não tem conta? <button type="button" onClick={() => setMode('signup')} className="text-lime-400 hover:underline font-semibold">Cadastre-se</button></p>
            ) : mode !== 'updatePassword' ? (
              <button type="button" onClick={() => setMode('login')} className="text-lime-400 hover:underline font-semibold">Voltar para o Login</button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}