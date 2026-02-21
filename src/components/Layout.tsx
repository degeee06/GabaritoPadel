import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex flex-col">
      <header className="py-4 px-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-lime-400">FatiaPadel v2</h1>
      </header>
      <main className="flex-grow p-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
