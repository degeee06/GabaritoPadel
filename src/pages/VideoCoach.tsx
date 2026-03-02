import React, { useState, useRef } from 'react';
import { ArrowLeft, Video, Loader2, Lock, Upload, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { analyzeTechnique } from '../services/api';
import { incrementUsageCount } from '../services/payment';
import { extractFramesFromVideo } from '../lib/video';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import ReactMarkdown from 'react-markdown';

interface VideoCoachProps {
  onBack: () => void;
  userProfile: { plan: string, usage_count: number } | null;
  onShowUpgrade: () => void;
  onUsageComplete: () => void;
}

const STROKES = [
  "Smash", "Bandeja", "Víbora", "Voleio de Direita", "Voleio de Esquerda", 
  "Saque", "Saída de Parede", "Globo"
];

export function VideoCoach({ onBack, userProfile, onShowUpgrade, onUsageComplete }: VideoCoachProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [strokeType, setStrokeType] = useState(STROKES[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert("O vídeo deve ter no máximo 50MB.");
        return;
      }
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;

    // Verificação de Limite
    if (userProfile) {
      if (userProfile.plan !== 'premium' && userProfile.usage_count >= 3) {
        onShowUpgrade();
        return;
      }
      if (userProfile.plan === 'premium' && userProfile.usage_count >= 100) {
        alert("Limite mensal de 100 análises de vídeo atingido.");
        return;
      }
    }

    setLoading(true);
    try {
      setProcessingStatus('Processando vídeo...');
      // Extrair frames do vídeo (client-side) para enviar imagens leves
      const frames = await extractFramesFromVideo(videoFile, 5);
      
      setProcessingStatus('Analisando biomecânica...');
      const result = await analyzeTechnique(frames, strokeType);
      
      await incrementUsageCount();
      onUsageComplete();
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis("Erro ao analisar o vídeo. Tente um vídeo mais curto e com boa iluminação.");
    } finally {
      setLoading(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-lime-400" />
          IA Video Coach
        </h1>
      </div>

      {!analysis ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl"
        >
          <div className="flex justify-between items-start mb-6">
            <p className="text-zinc-300 text-sm">
              Envie um vídeo curto (5-10s) executando um golpe.
              A IA analisará sua biomecânica frame a frame.
            </p>
            {userProfile && userProfile.plan !== 'premium' && (
               <div className="bg-zinc-900 px-3 py-1 rounded-full text-xs text-zinc-500 border border-zinc-800 flex items-center gap-1">
                 <Lock className="w-3 h-3" />
                 {Math.max(0, 3 - userProfile.usage_count)} créditos
               </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seletor de Golpe */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Qual golpe você está treinando?</label>
              <select 
                value={strokeType}
                onChange={(e) => setStrokeType(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-lime-500 outline-none"
              >
                {STROKES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Upload de Vídeo */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${videoUrl ? 'border-lime-500/50 bg-lime-500/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
              
              {videoUrl ? (
                <div className="w-full relative">
                  <video src={videoUrl} className="w-full rounded-lg max-h-64 object-contain bg-black" controls />
                  <div className="mt-2 text-center text-xs text-lime-400 font-medium">Vídeo carregado. Clique para trocar.</div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-zinc-500 mb-3" />
                  <p className="text-zinc-300 font-medium">Toque para enviar vídeo</p>
                  <p className="text-zinc-500 text-xs mt-1">Máx 50MB (MP4, MOV)</p>
                </>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading || !videoFile}
              className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{processingStatus}</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6" />
                  Analisar Movimento
                </>
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
            <h2 className="text-xl font-bold text-white">Análise Biomecânica</h2>
            <TextToSpeechButton text={analysis} className="bg-zinc-700 hover:bg-lime-500 hover:text-zinc-900" />
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl prose prose-invert prose-sm max-w-none prose-headings:text-lime-400 prose-strong:text-white">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
          
          <button 
            onClick={() => { setAnalysis(null); setVideoFile(null); setVideoUrl(null); }}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            Analisar Outro Golpe
          </button>
        </motion.div>
      )}
    </div>
  );
}
