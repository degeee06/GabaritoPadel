import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';
import { Loader2, Mail, Lock } from 'lucide-react';

export function AuthPage() {
  // Estados de visualização
  const [mode, setMode] = useState<'login' | 'signup' | 'recovery' | 'updatePassword'>('login');
  
  // Estados dos campos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const turnstileRef = useRef<any>(null);

  // Detecta se o usuário veio pelo link de recuperação de senha do e-mail
 useEffect(() => {
    // 1. Verifica se a URL contém o tipo "recovery" (o link do email traz isso)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setMode('updatePassword');
    }

    // 2. Escuta mudanças de estado (backup caso o hash mude rápido)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
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
      setError("Por favor, complete o desafio de segurança.");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (mode === 'recovery') {
        // 1. Solicitar link de recuperação
        result = await supabase.auth.resetPasswordForEmail(email, {
          captchaToken: captchaToken || undefined,
          redirectTo: `${window.location.origin}`, 
        });
      } else if (mode === 'updatePassword') {
        // 2. Definir a nova senha de fato
        result = await supabase.auth.updateUser({ password });
      } else if (mode === 'signup') {
        // 3. Cadastro
        result = await supabase.auth.signUp({
          email,
          password,
          options: { captchaToken: captchaToken || undefined },
        });
      } else {
        // 4. Login
        result = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: captchaToken || undefined },
        });
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        if (mode === 'recovery') {
          setMessage('Instruções enviadas para seu e-mail!');
        } else if (mode === 'updatePassword') {
          setMessage('Senha atualizada com sucesso! Você já pode entrar.');
          setTimeout(() => setMode('login'), 3000);
        } else if (mode === 'signup') {
          setMessage('Verifique seu e-mail para confirmar o cadastro!');
        } else {
          setMessage('Login bem-sucedido!');
          // Aqui você pode redirecionar: window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const getTexts = () => {
    if (mode === 'recovery') return { title: 'Recuperar Senha', button: 'Enviar Instruções' };
    if (mode === 'updatePassword') return { title: 'Nova Senha', button: 'Atualizar Senha' };
    return mode === 'signup' ? { title: 'Crie sua conta', button: 'Cadastrar' } : { title: 'Acesse sua conta', button: 'Entrar' };
  };

  return (
    <div className="max-w-md mx-auto pt-10 px-4">
      <h1 className="text-3xl font-bold text-center text-white mb-2">GabaritoPadel</h1>
      <p className="text-center text-zinc-400 mb-6">{getTexts().title}</p>
      
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-700/50">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo de Email - Escondido apenas na hora de digitar a NOVA senha */}
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

          {/* Campo de Senha - Escondido apenas no pedido de recuperação */}
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

          {/* Captcha - Escondido apenas na atualização de senha final */}
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

          {/* Rodapé Alternável */}
          <div className="text-center text-sm text-zinc-400 pt-2">
            {mode === 'login' ? (
              <p>Não tem conta? <button type="button" onClick={() => setMode('signup')} className="text-lime-400 hover:underline font-semibold">Cadastre-se</button></p>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="text-lime-400 hover:underline font-semibold">Voltar para o Login</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
