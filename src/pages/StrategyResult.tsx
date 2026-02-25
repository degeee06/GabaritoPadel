import React, { useState } from 'react';
import { ArrowLeft, Target, CheckSquare, AlertTriangle, Shield, Sword, Map, Info, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalPlan } from '../types';
import { PositionGuide } from '../components/PositionGuide';
import { TextToSpeechButton } from '../components/TextToSpeechButton';

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
  const [viewGuide, setViewGuide] = useState<string | null>(null);

  if (viewGuide) {
    return <PositionGuide positionId={viewGuide} onBack={() => setViewGuide(null)} />;
  }

  // Prepara o texto completo para leitura
  const fullText = `
    Plano Tático Gerado.
    Resumo: ${plan.summary}
    Alvo Principal: ${plan.main_target}
    Checklist Tático: ${plan.tactical_checklist.join('. ')}
    Armadilhas a evitar: ${plan.traps_to_avoid.join('. ')}
    Estratégia Ofensiva: ${plan.offensive_strategy.join('. ')}
    Estratégia Defensiva: ${plan.defensive_strategy.join('. ')}
  `;

  const handleShare = async () => {
    const text = `🎾 *GabaritoPadel - Estratégia Vencedora* 🎾\n\n🎯 *Alvo:* ${plan.main_target}\n\n📝 *Resumo:* ${plan.summary}\n\n✅ *Checklist:*\n${plan.tactical_checklist.map(i => `• ${i}`).join('\n')}\n\n🚀 Gere sua estratégia em: gabaritopadel.app`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Estratégia de Padel',
          text: text,
        });
      } catch (err) {
        console.log('Erro ao compartilhar', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Estratégia copiada para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar e Editar
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 text-lime-400 hover:text-lime-300 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-bold">Compartilhar</span>
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Plano Tático Gerado</h1>
          <TextToSpeechButton text={fullText} />
        </div>
        <p className="text-zinc-400 mt-2 max-w-prose">{plan.summary}</p>
      </motion.div>

      {/* Botões de Referência Rápida */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setViewGuide('ataque')}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-3 rounded-lg text-sm text-lime-400 transition-colors"
        >
          <Sword className="w-4 h-4" />
          Ver Posição de Ataque
        </button>
        <button 
          onClick={() => setViewGuide('defesa')}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-3 rounded-lg text-sm text-lime-400 transition-colors"
        >
          <Shield className="w-4 h-4" />
          Ver Posição de Defesa
        </button>
        <button 
          onClick={() => setViewGuide('saque')}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-3 rounded-lg text-sm text-lime-400 transition-colors"
        >
          <Info className="w-4 h-4" />
          Ver Posição de Saque
        </button>
        <button 
          onClick={() => setViewGuide('diagrama')}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-3 rounded-lg text-sm text-lime-400 transition-colors"
        >
          <Map className="w-4 h-4" />
          Ver Zonas da Quadra
        </button>
      </div>

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
