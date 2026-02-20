import React from 'react';
import { cn } from '../lib/utils';
import { Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.3)]">
            <Activity className="w-5 h-5 text-zinc-900" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Padel IQ</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
          <img src="https://picsum.photos/seed/user/200" alt="User" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
        </div>
      </header>
      <main className={cn("flex-1 px-4 py-6 max-w-md mx-auto w-full", className)}>
        {children}
      </main>
    </div>
  );
}
