import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Loader2, Image as ImageIcon, X } from 'lucide-react';
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
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      myTeamDescription: myTeam,
      opponentsDescription: opponents,
      image: image || undefined,
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

      <form onSubmit={handleSubmit} className="space-y-6 pb-10">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Sua Dupla</label>
          <textarea
            value={myTeam}
            onChange={(e) => setMyTeam(e.target.value)}
            placeholder="Descreva você e seu parceiro..."
            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-lime-400 focus:border-transparent placeholder:text-zinc-600 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Adversários</label>
          <textarea
            value={opponents}
            onChange={(e) => setOpponents(e.target.value)}
            placeholder="Descreva os oponentes..."
            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-lime-400 focus:border-transparent placeholder:text-zinc-600 resize-none"
            required
          />
        </div>

        {/* Image Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Anexar Imagem (Opcional)</label>
          {!image ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all"
            >
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">Foto da quadra ou oponentes</span>
            </button>
          ) : (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-700">
              <img src={image} alt="Upload" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={fillExample}
            className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
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
                Analisando...
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
