import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MatchInput } from '../types';

interface StrategyFormProps {
  onBack: () => void;
  onSubmit: (input: MatchInput) => void;
  loading: boolean;
}

export function StrategyForm({ onBack, onSubmit, loading }: StrategyFormProps) {
  const [myTeamDescription, setMyTeamDescription] = useState('');
  const [opponentsDescription, setOpponentsDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeamDescription.trim() || !opponentsDescription.trim()) {
      alert('Por favor, preencha as descrições das duplas.');
      return;
    }
    onSubmit({ myTeamDescription, opponentsDescription });
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Análise da Partida</h1>
        <p className="text-zinc-400 mt-1">Descreva os jogadores para uma análise tática precisa.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="my-team" className="font-medium text-zinc-300">Minha Dupla</label>
          <textarea
            id="my-team"
            value={myTeamDescription}
            onChange={(e) => setMyTeamDescription(e.target.value)}
            placeholder="Ex: Eu (drive, boa bandeja) e meu parceiro (revés, bom voleio)"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 h-24 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="opponents" className="font-medium text-zinc-300">Adversários</label>
          <textarea
            id="opponents"
            value={opponentsDescription}
            onChange={(e) => setOpponentsDescription(e.target.value)}
            placeholder="Ex: Drive canhoto agressivo, bom smash. Revés defensivo, erra bolas baixas."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 h-24 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition"
            disabled={loading}
          />
        </div>


        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-zinc-600 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analisando...</>
          ) : (
            'Gerar Estratégia Vencedora'
          )}
        </button>
      </form>
    </div>
  );
}
