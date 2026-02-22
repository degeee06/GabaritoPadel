import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InstallPWAButtonProps {
  installPrompt: any;
  triggerInstall: () => void;
}

export function InstallPWAButton({ installPrompt, triggerInstall }: InstallPWAButtonProps) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIosDevice);
  }, []);

  const handleInstallClick = () => {
    if (isIOS) {
      alert("Para instalar no iOS: toque em 'Compartilhar' e depois em 'Adicionar à Tela de Início'");
      return;
    }
    triggerInstall();
  };

  if (!installPrompt && !isIOS) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 bg-lime-500 text-zinc-900 font-bold text-xs px-3 py-1.5 rounded-full hover:bg-lime-600 transition-colors"
      aria-label="Instalar Aplicativo"
    >
      <Download size={14} />
      <span>Instalar App</span>
    </button>
  );
}
