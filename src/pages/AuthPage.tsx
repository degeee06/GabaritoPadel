import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';
import { Loader2 } from 'lucide-react';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!captchaToken) {
      setError("Por favor, complete o desafio de segurança.");
      return;
    }

    setLoading(true);

    const authMethod = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;

    const { error } = await authMethod({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(isSignUp ? 'Verifique seu email para confirmar o cadastro!' : 'Login bem-sucedido!');
    }
    
    setLoading(false);
    turnstileRef.current?.reset();
    setCaptchaToken(null);
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <h1 className="text-3xl font-bold text-center text-white mb-2">GabaritoPadel</h1>
      <p className="text-center text-zinc-400 mb-6">{isSignUp ? 'Crie sua conta para começar' : 'Acesse sua conta'}</p>
      
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-lime-500 outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-lime-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => { setError('Falha no desafio de segurança. Recarregue a página.'); setCaptchaToken(null); }}
              onExpire={() => { setCaptchaToken(null); }}
              options={{ theme: 'dark', size: 'normal' }}
            />
          </div>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          {message && <p className="text-lime-400 text-center text-sm">{message}</p>}

          <button 
            type="submit" 
            disabled={loading || !captchaToken}
            className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-zinc-600 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>

          <p className="text-center text-sm text-zinc-400">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="text-lime-400 hover:underline ml-1">
              {isSignUp ? 'Entrar' : 'Cadastre-se'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
