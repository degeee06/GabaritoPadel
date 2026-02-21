import { useEffect, useState } from 'react';

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta se é iOS
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIosDevice);

    // Captura o evento de instalação no Android/Desktop
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Lógica para iOS (mostra instruções manuais)
    if (isIOS) {
      alert("Para instalar no iOS: toque em 'Compartilhar' e depois em 'Adicionar à Tela de Início'");
      return;
    }

    // Lógica para Android/Desktop
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="bg-lime-500 hover:bg-lime-600 text-zinc-900 font-bold py-2 px-4 rounded-lg transition-all text-sm animate-pulse"
    >
      Instalar Aplicativo
    </button>
  );
}
