import { motion } from 'framer-motion';
import { Match } from '../types';
import { deleteHistory } from '../services/api';

interface HistoryPageProps {
  matches: Match[];
  onMatchSelect: (match: Match) => void;
  onNewMatch: () => void;
  onHistoryDeleted: () => void;
}

export function HistoryPage({ matches, onMatchSelect, onNewMatch, onHistoryDeleted }: HistoryPageProps) {

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir todo o seu histórico de análises? Esta ação não pode ser desfeita.')) {
      try {
        await deleteHistory();
        onHistoryDeleted();
      } catch (error) {
        alert('Erro ao excluir o histórico. Tente novamente.');
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
              className="bg-zinc-800 p-4 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors border border-transparent hover:border-lime-500"
            >
              <div className="flex justify-between items-center">
                <div className="truncate pr-4">
                  <p className="font-semibold text-white truncate">{match.my_team_description}</p>
                  <p className="text-sm text-zinc-400 truncate">vs {match.opponents_description}</p>
                </div>
                <p className="text-xs text-zinc-500 flex-shrink-0">{new Date(match.created_at).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
          <div className="text-center pt-4">
            <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-400 transition-colors">
              Excluir Histórico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
