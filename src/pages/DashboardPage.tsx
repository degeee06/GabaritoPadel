
import { InstallPWAButton } from '../components/InstallPWAButton';
import { BookOpen, Activity } from 'lucide-react';

interface DashboardPageProps {
  onStartAnalysis: () => void;
  onViewHistory: () => void;
  onViewGuide: () => void;
  onViewServeGuide: () => void;
}

export function DashboardPage({ onStartAnalysis, onViewHistory, onViewGuide, onViewServeGuide }: DashboardPageProps) {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold text-white">Olá Jogador!</h1>
      <p className="text-zinc-400 mt-4 max-w-md mx-auto">Pronto para elevar seu nível de jogo? Use a inteligência artificial para analisar suas partidas e receber estratégias vencedoras.</p>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={onStartAnalysis}
          className="bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-all text-lg"
        >
          Analisar Nova Partida
        </button>
        <button 
          onClick={onViewHistory}
          className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg transition-all text-lg"
        >
          Ver Histórico
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={onViewGuide}
          className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
        >
          <BookOpen className="w-5 h-5" />
          Guia de Posições
        </button>
        <button 
          onClick={onViewServeGuide}
          className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
        >
          <Activity className="w-5 h-5" />
          Guia de Saques
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <InstallPWAButton />
      </div>
    </div>
  );
}
