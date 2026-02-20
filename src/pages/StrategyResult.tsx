import React from 'react';
import { ArrowLeft, Target, CheckCircle2, AlertTriangle, Shield, Sword } from 'lucide-react';
import { motion } from 'motion/react';
import { TacticalPlan } from '../types';

interface StrategyResultProps {
  plan: TacticalPlan;
  onBack: () => void;
}

export function StrategyResult({ plan, onBack }: StrategyResultProps) {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Plano Tático</h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Summary */}
        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
          <p className="text-zinc-300 italic leading-relaxed">"{plan.summary}"</p>
        </div>

        {/* Main Target - Red Card */}
        <div className="bg-gradient-to-br from-red-900/50 to-red-950/50 p-6 rounded-2xl border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-100">Alvo Principal</h3>
          </div>
          <p className="text-xl font-bold text-white tracking-tight">{plan.main_target}</p>
        </div>

        {/* Tactical Checklist */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-lime-400" />
            Checklist Tático
          </h3>
          <div className="space-y-3">
            {plan.tactical_checklist.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-zinc-800 p-4 rounded-xl border border-zinc-700/50"
              >
                <div className="mt-1 w-5 h-5 rounded-full border-2 border-lime-400/30 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                </div>
                <p className="text-zinc-200 font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Traps to Avoid - Yellow Alert */}
        <div className="bg-yellow-900/20 p-5 rounded-xl border border-yellow-600/30">
          <h3 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Armadilhas a Evitar
          </h3>
          <ul className="space-y-2">
            {plan.traps_to_avoid.map((trap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-yellow-200/80 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                {trap}
              </li>
            ))}
          </ul>
        </div>

        {/* Specific Strategies */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
            <h4 className="font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <Sword className="w-4 h-4 text-orange-400" /> Ataque
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
              {plan.offensive_strategy.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
            <h4 className="font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Defesa
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
              {plan.defensive_strategy.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
