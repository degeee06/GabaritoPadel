import { motion } from 'framer-motion';
import { Match } from '../types';
import { deleteMatchById } from '../services/api';

interface HistoryPageProps {
  matches: Match[];
  onMatchSelect: (match: Match) => void;
  onNewMatch: () => void;
  onMatchDeleted: (matchId: string) => void;
}

export function HistoryPage({ matches, onMatchSelect, onNewMatch, onMatchDeleted }: HistoryPageProps) {

  const handleDelete = async (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation(); // Impede que o clique na lixeira selecione a partida
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      try {
        await deleteMatchById(matchId);
        onMatchDeleted(matchId);
      } catch (error) {
        alert('Erro ao excluir a análise. Tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Histórico de Análises</h1>
        <button 
          onClick={onNewMatch}
          className="bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-2 px-4 rounded-lg transition-all"
        >
          Analisar Nova Partida
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-10 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-semibold text-white">Nenhuma análise salva</h3>
          <p className="text-zinc-400 mt-2">Clique em "Analisar Nova Partida" para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onMatchSelect(match)}
              className="bg-zinc-800 p-4 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors border border-transparent hover:border-lime-500 group relative"
            >
              <div className="flex justify-between items-center">
                <div className="truncate pr-8">
                  <p className="font-semibold text-white truncate">{match.my_team_description}</p>
                  <p className="text-sm text-zinc-400 truncate">vs {match.opponents_description}</p>
                </div>
                <p className="text-xs text-zinc-500 flex-shrink-0">{new Date(match.created_at).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={(e) => handleDelete(e, match.id)}
                className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-700/50 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
