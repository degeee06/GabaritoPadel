import React from 'react';
import { ArrowLeft, Target, CheckSquare, AlertTriangle, Shield, Sword } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalPlan } from '../types';

interface StrategyResultProps {
  plan: TacticalPlan;
  onBack: () => void;
}

const Section = ({ icon, title, items }: { icon: React.ReactNode, title: string, items: string[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-800/50 border border-zinc-700/50 p-5 rounded-xl"
  >
    <h3 className="text-lg font-semibold text-lime-400 flex items-center gap-3 mb-3">
      {icon}
      {title}
    </h3>
    <ul className="space-y-2 list-disc list-inside text-zinc-300">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  </motion.div>
);

export function StrategyResult({ plan, onBack }: StrategyResultProps) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar e Editar
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Plano Tático Gerado</h1>
        <p className="text-zinc-400 mt-2 max-w-prose">{plan.summary}</p>
      </motion.div>

      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-lime-900/30 border border-lime-700/50 p-5 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-lime-300 flex items-center gap-3 mb-2">
            <Target className="w-6 h-6" />
            Alvo Principal
          </h3>
          <p className="text-lime-100">{plan.main_target}</p>
        </motion.div>

        <Section icon={<CheckSquare className="w-6 h-6" />} title="Checklist Tático" items={plan.tactical_checklist} />
        <Section icon={<AlertTriangle className="w-6 h-6" />} title="Armadilhas a Evitar" items={plan.traps_to_avoid} />
        <Section icon={<Sword className="w-6 h-6" />} title="Estratégia Ofensiva" items={plan.offensive_strategy} />
        <Section icon={<Shield className="w-6 h-6" />} title="Estratégia Defensiva" items={plan.defensive_strategy} />
      </div>
    </div>
  );
}
