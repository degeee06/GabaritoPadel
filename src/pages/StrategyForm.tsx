import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { MatchInput } from '../types';

interface StrategyFormProps {
  onBack: () => void;
  onSubmit: (data: MatchInput) => void;
  loading: boolean;
}

export function StrategyForm({ onBack, onSubmit, loading }: StrategyFormProps) {
  const [myTeam, setMyTeam] = useState('');
  const [opponents, setOpponents] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      myTeamDescription: myTeam,
      opponentsDescription: opponents,
    });
  };

  const fillExample = () => {
    setMyTeam("Eu jogo na direita, sou destro, defendo bem mas tenho bandeja fraca. Meu parceiro é canhoto, agressivo e tem smash forte.");
    setOpponents("Oponente da direita é alto e voleia muito bem. O da esquerda é consistente no fundo mas não sabe sair da parede.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Nova Análise</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Sua Dupla</label>
          <textarea
            value={myTeam}
            onChange={(e) => setMyTeam(e.target.value)}
            placeholder="Descreva você e seu parceiro (pontos fortes, fracos, lado que jogam...)"
            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-lime-400 focus:border-transparent placeholder:text-zinc-600 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Adversários</label>
          <textarea
            value={opponents}
            onChange={(e) => setOpponents(e.target.value)}
            placeholder="Descreva os oponentes (estilo de jogo, golpes preferidos, fraquezas aparentes...)"
            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-lime-400 focus:border-transparent placeholder:text-zinc-600 resize-none"
            required
          />
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={fillExample}
            className="w-full py-3 text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
          >
            Preencher com exemplo
          </button>

          <button
            type="submit"
            disabled={loading || !myTeam || !opponents}
            className="w-full bg-lime-400 hover:bg-lime-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-900 font-bold text-lg py-4 rounded-xl shadow-lg shadow-lime-400/20 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando Tática...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analisar com IA
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
