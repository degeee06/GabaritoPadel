import { motion } from 'framer-motion';
import { positions } from '../data/positions';

interface PositionGuideProps {
  positionId?: string;
  onBack?: () => void;
}

export function PositionGuide({ positionId, onBack }: PositionGuideProps) {
  const selectedPositions = positionId 
    ? positions.filter(p => p.id === positionId)
    : positions;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-lime-400">Guia de Posições</h2>
        {onBack && (
          <button 
            onClick={onBack}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Voltar
          </button>
        )}
      </div>

      <div className="grid gap-8">
        {selectedPositions.map((pos) => (
          <div key={pos.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{pos.title}</h3>
              <p className="text-zinc-300 mb-4">{pos.description}</p>
              
              <div className="mb-6 aspect-video bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700/50">
                <img 
                  src={pos.image} 
                  alt={pos.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback se a imagem não existir
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div class="text-zinc-500 text-sm p-4 text-center">Imagem não encontrada: ${pos.image}<br/>Adicione o arquivo na pasta public</div>`;
                  }}
                />
              </div>

              <ul className="space-y-2">
                {pos.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
