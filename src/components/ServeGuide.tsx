import { motion } from 'framer-motion';
import { serves } from '../data/serves';
import { TextToSpeechButton } from './TextToSpeechButton';

interface ServeGuideProps {
  serveId?: string;
  onBack?: () => void;
}

export function ServeGuide({ serveId, onBack }: ServeGuideProps) {
  const selectedServes = serveId 
    ? serves.filter(s => s.id === serveId)
    : serves;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-lime-400">Guia de Saques</h2>
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
        {selectedServes.map((serve) => (
          <div key={serve.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{serve.title}</h3>
                <TextToSpeechButton 
                  text={`${serve.title}. ${serve.description}. Detalhes: ${serve.details.join('. ')}`} 
                />
              </div>
              <p className="text-zinc-300 mb-4">{serve.description}</p>
              
              <div className="mb-6 aspect-video bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700/50">
                <img 
                  src={serve.image} 
                  alt={serve.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback se a imagem não existir
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div class="text-zinc-500 text-sm p-4 text-center">Imagem não encontrada: ${serve.image}<br/>Adicione o arquivo na pasta public</div>`;
                  }}
                />
              </div>

              <ul className="space-y-4">
                {serve.details.map((detail, index) => {
                  const [title, content] = detail.split(': ');
                  return (
                    <li key={index} className="text-sm text-zinc-400">
                      <strong className="text-lime-500 block mb-1">{title}:</strong>
                      <span>{content || detail}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
