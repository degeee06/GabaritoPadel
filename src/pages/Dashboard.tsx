import React, { useEffect, useState } from 'react';
import { Play, History, ChevronRight, Trophy, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Match } from '../types';

interface DashboardProps {
  onStart: () => void;
}

export function Dashboard({ onStart }: DashboardProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (data && !error) {
          setMatches(data);
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Bem-vindo de volta</h2>
        <h1 className="text-3xl font-bold text-white">Olá, Jogador</h1>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold text-lg py-6 rounded-2xl shadow-[0_0_20px_rgba(163,230,53,0.2)] flex items-center justify-center gap-3 transition-all"
      >
        <Play className="w-6 h-6 fill-current" />
        Gerar Estratégia
      </motion.button>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-500" />
            Últimos Jogos
          </h3>
          <button className="text-xs text-lime-400 font-medium hover:underline">Ver todos</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl text-center">
              <p className="text-zinc-400 text-sm">Nenhuma partida registrada ainda.</p>
              <p className="text-zinc-500 text-xs mt-1">Gere sua primeira estratégia para começar.</p>
            </div>
          ) : (
            matches.map((game, idx) => {
              // Extract a short name from opponents description or use a fallback
              const opponentName = game.opponents_description.split('.')[0].substring(0, 30) + "...";
              const date = new Date(game.created_at).toLocaleDateString('pt-BR');
              
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${game.result === 'Vitória' ? 'bg-green-500/10 text-green-500' : game.result === 'Derrota' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-700 text-zinc-400'}`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="max-w-[180px]">
                      <p className="font-medium text-zinc-200 truncate" title={game.opponents_description}>
                        {opponentName}
                      </p>
                      <p className="text-xs text-zinc-500">{date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {game.result ? (
                      <>
                        <p className={`font-bold ${game.result === 'Vitória' ? 'text-green-400' : 'text-red-400'}`}>{game.result}</p>
                        <p className="text-xs text-zinc-500 font-mono">{game.score}</p>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">Sem resultado</span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
