
interface DashboardPageProps {
  onStartAnalysis: () => void;
  onViewHistory: () => void;
}

export function DashboardPage({ onStartAnalysis, onViewHistory }: DashboardPageProps) {
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
    </div>
  );
}
