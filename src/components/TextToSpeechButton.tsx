import { useState, useEffect } from 'react';
import { Volume2, StopCircle } from 'lucide-react';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export function TextToSpeechButton({ text, className = '' }: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    // Limpa a fala ao desmontar o componente
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Limpa caracteres especiais do Markdown para leitura
    const cleanText = text
      .replace(/\*/g, '') // Remove asteriscos
      .replace(/#/g, '')  // Remove hashtags
      .replace(/-/g, '')  // Remove traços de lista
      .replace(/\[.*?\]/g, '') // Remove colchetes e conteúdo interno se for metadado
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR'; // Tenta forçar português do Brasil
    utterance.rate = 1.2; // Aumenta um pouco a velocidade da leitura
    
    // Tenta encontrar uma voz em português
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-lime-400 ${className}`}
      title={isSpeaking ? "Parar leitura" : "Ouvir texto"}
      aria-label={isSpeaking ? "Parar leitura" : "Ouvir texto"}
    >
      {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
