import React, { useState, useRef } from 'react';
import { ArrowLeft, Loader2, Image as ImageIcon, X } from 'lucide-react';
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
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeamDescription.trim() || !opponentsDescription.trim()) {
      alert('Por favor, preencha as descrições das duplas.');
      return;
    }
    onSubmit({ myTeamDescription, opponentsDescription, image: image || undefined });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Análise da Partida</h1>
        <p className="text-zinc-400 mt-1">Descreva os jogadores e anexe uma imagem para uma análise mais precisa.</p>
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

        <div className="space-y-2">
          <label className="font-medium text-zinc-300">Análise Visual (Opcional)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-lime-400 transition"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
              disabled={loading}
            />
            {image ? (
              <div className="relative">
                <img src={image} alt="Preview" className="max-h-40 rounded-lg" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-zinc-500 mb-2" />
                <p className="text-zinc-400">Clique para anexar uma imagem</p>
                <p className="text-xs text-zinc-600">Posicionamento, postura, etc.</p>
              </>
            )}
          </div>
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
