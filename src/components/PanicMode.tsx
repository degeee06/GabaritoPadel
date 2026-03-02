import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Zap, Loader2, Lock } from 'lucide-react';
import { generatePanicTip } from '../services/api';
import { incrementUsageCount } from '../services/payment';
import { TextToSpeechButton } from './TextToSpeechButton';

interface PanicModeProps {
  onClose: () => void;
  userProfile: { plan: string, usage_count: number } | null;
  onShowUpgrade: () => void;
  onUsageComplete: () => void;
}

export function PanicMode({ onClose, userProfile, onShowUpgrade, onUsageComplete }: PanicModeProps) {
  const [score, setScore] = useState('');
  const [problem, setProblem] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePanic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    // Verificação de Limite
    if (userProfile) {
      if (userProfile.plan !== 'premium' && userProfile.usage_count >= 3) {
        onShowUpgrade();
        return;
      }
      if (userProfile.plan === 'premium' && userProfile.usage_count >= 100) {
        alert("Limite mensal de 100 usos atingido.");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await generatePanicTip(score || "Não informado", problem);
      await incrementUsageCount(); // Contabiliza como uso
      onUsageComplete(); // Atualiza o perfil no App
      setTip(result);
    } catch (error) {
      setTip("Concentre-se em passar a bola. O erro é do adversário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-zinc-900 border-2 border-red-500 rounded-xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
            <h2 className="text-2xl font-bold uppercase tracking-wider">Modo Virada</h2>
          </div>
          {userProfile && userProfile.plan !== 'premium' && (
            <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-500 border border-zinc-700 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {Math.max(0, 3 - userProfile.usage_count)} créditos
            </div>
          )}
        </div>

        {!tip ? (
          <form onSubmit={handlePanic} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-1">Placar (Opcional)</label>
              <input 
                type="text" 
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Ex: 0-3, 15-40"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">O que está acontecendo?</label>
              <textarea 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Ex: Estamos tomando muito globo / Eles estão muito agressivos na rede"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-red-500 outline-none h-24"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !problem.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-6 h-6" /> SALVAR O JOGO</>}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-red-500/30 relative">
              <div className="absolute top-2 right-2">
                <TextToSpeechButton text={tip} />
              </div>
              <h3 className="text-red-400 text-sm font-bold uppercase mb-2">Instrução Tática Imediata</h3>
              <p className="text-2xl text-white font-bold leading-relaxed">{tip}</p>
            </div>
            <button 
              onClick={() => { setTip(null); setProblem(''); }}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg"
            >
              Nova Dica
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
