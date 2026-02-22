import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Turnstile from 'react-turnstile';

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!turnstileToken) {
      setMessage('Por favor, complete a verificação de segurança.');
      setLoading(false);
      return;
    }

    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken },
      });

      if (verifyError || (verifyData && !verifyData.success)) {
        throw new Error(verifyError?.message || 'Falha na verificação. Tente novamente.');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      setMessage('Verifique seu e-mail para o link de login!');
    } catch (error: any) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <h1 className="text-3xl font-bold text-center text-white mb-2">GabaritoPadel</h1>
      <p className="text-zinc-400 text-center mb-6">Acesse sua conta com um link mágico.</p>
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg">
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
              Seu email
            </label>
            <input
              id="email"
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-lime-400"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Turnstile
              sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              theme="dark"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            disabled={loading || !turnstileToken}
          >
            {loading ? 'Enviando...' : 'Receber Link Mágico'}
          </button>

          {message && <p className="text-center text-lime-300 mt-4 text-sm">{message}</p>}
        </form>
      </div>
    </div>
  );
}
