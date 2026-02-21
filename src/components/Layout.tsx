import React from 'react';

import { supabase } from '../lib/supabase';

export function Layout({ children }: { children: React.ReactNode }) {
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex flex-col">
      <header className="py-4 px-6 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-lime-400">GabaritoPadel</h1>
        <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-white transition-colors">Sair</button>
      </header>
      <main className="flex-grow p-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
