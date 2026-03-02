import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateEquipmentAdvice } from '../services/api';
import { incrementUsageCount } from '../services/payment';
import ReactMarkdown from 'react-markdown';

interface EquipmentConsultantProps {
  onBack: () => void;
  userProfile: { plan: string, usage_count: number } | null;
  onShowUpgrade: () => void;
  onUsageComplete: () => void;
}

export function EquipmentConsultant({ onBack, userProfile, onShowUpgrade, onUsageComplete }: EquipmentConsultantProps) {
  const [description, setDescription] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Verificação de Limite
    if (userProfile) {
      if (userProfile.plan !== 'premium' && userProfile.usage_count >= 3) {
        onShowUpgrade();
        return;
      }
      if (userProfile.plan === 'premium' && userProfile.usage_count >= 100) {
        alert("Limite mensal de 100 consultas atingido.");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await generateEquipmentAdvice(description);
      await incrementUsageCount(); // Contabiliza como uso
      onUsageComplete(); // Atualiza o perfil no App
      setAdvice(result);
    } catch (error) {
      setAdvice("Erro ao gerar consultoria. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-lime-400" />
          Consultor Pro
        </h1>
      </div>

      {!advice ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl"
        >
          <div className="flex justify-between items-start mb-6">
            <p className="text-zinc-300 text-sm">
              Descreva seu estilo (agressivo/controle), nível de jogo e se sente dores.
              Receba uma ficha técnica personalizada.
            </p>
            {userProfile && userProfile.plan !== 'premium' && (
               <div className="bg-zinc-900 px-3 py-1 rounded-full text-xs text-zinc-500 border border-zinc-800 flex items-center gap-1">
                 <Lock className="w-3 h-3" />
                 {3 - userProfile.usage_count} créditos
               </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Jogo na esquerda, gosto de definir o ponto no smash, mas sinto o cotovelo se a raquete for muito dura..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white focus:border-lime-500 outline-none h-32 resize-none text-sm"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Gerar Ficha Técnica"}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl prose prose-invert prose-sm max-w-none prose-headings:text-lime-400 prose-strong:text-white">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
          
          <button 
            onClick={() => { setAdvice(null); setDescription(''); }}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            Nova Consulta
          </button>
        </motion.div>
      )}
    </div>
  );
}
