import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  return (
    <div className="max-w-md mx-auto pt-10">
      <h1 className="text-3xl font-bold text-center text-white mb-6">GabaritoPadel</h1>
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu email',
                password_label: 'Sua senha',
                button_label: 'Entrar',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'Seu email',
                password_label: 'Crie uma senha',
                button_label: 'Cadastrar',
                social_provider_text: 'Cadastrar com {{provider}}',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
              forgotten_password: {
                email_label: 'Seu email',
                password_label: 'Sua senha',
                button_label: 'Enviar instruções',
                link_text: 'Esqueceu a senha?',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
