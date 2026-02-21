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
          className="bg-red-900/20 border border-red-500/30 p-5 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-red-300 flex items-center gap-3 mb-2">
            <Target className="w-6 h-6" />
            Alvo Principal
          </h3>
          <p className="text-red-100 font-bold text-lg">{plan.main_target}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 p-5 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-lime-400 flex items-center gap-3 mb-4">
            <CheckSquare className="w-6 h-6" />
            Checklist Tático
          </h3>
          <div className="space-y-3">
            {plan.tactical_checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckSquare className="w-5 h-5 text-lime-500 mt-1 flex-shrink-0" />
                <p className="text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-900/20 border border-amber-500/30 p-5 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6" />
            Armadilhas a Evitar
          </h3>
          <ul className="space-y-2 text-amber-200">
            {plan.traps_to_avoid.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <Section icon={<Sword className="w-6 h-6" />} title="Estratégia Ofensiva" items={plan.offensive_strategy} />
        <Section icon={<Shield className="w-6 h-6" />} title="Estratégia Defensiva" items={plan.defensive_strategy} />
      </div>
    </div>
  );
}
