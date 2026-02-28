import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateEquipmentAdvice } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface EquipmentConsultantProps {
  onBack: () => void;
}

export function EquipmentConsultant({ onBack }: EquipmentConsultantProps) {
  const [description, setDescription] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const result = await generateEquipmentAdvice(description);
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
          Consultor de Equipamento
        </h1>
      </div>

      {!advice ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl"
        >
          <p className="text-zinc-300 mb-6">
            Descreva seu estilo de jogo, nível, e se tem alguma dor ou dificuldade específica. 
            A IA irá sugerir o equipamento ideal para você.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Seu Perfil</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Sou agressivo, gosto de smashar, mas tenho sentido dores no cotovelo. Jogo na esquerda."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white focus:border-lime-500 outline-none h-40 resize-none"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Consultar Especialista"}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl prose prose-invert max-w-none">
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
