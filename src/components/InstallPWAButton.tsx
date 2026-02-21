import { useEffect, useState } from 'react';
import { Modal } from './Modal';

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isInStandaloneMode);

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
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const shouldShowInstallButton = !isStandalone && (!!deferredPrompt || isIOS);

  if (!shouldShowInstallButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="bg-lime-500 hover:bg-lime-600 text-zinc-900 font-bold py-2 px-4 rounded-lg transition-all text-sm animate-pulse"
      >
        Instalar App
      </button>
      <Modal isOpen={showIOSInstructions} onClose={() => setShowIOSInstructions(false)} title="Instalar no iPhone/iPad">
        <div className="flex flex-col gap-4 text-center p-2">
            <p className="text-zinc-300">Este aplicativo pode ser instalado na sua tela inicial para funcionar como um app nativo.</p>
            <ol className="text-left text-sm text-zinc-400 space-y-3 bg-zinc-700/50 p-4 rounded-lg">
                <li className="flex items-start gap-2">
                    <span className="bg-zinc-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">1</span>
                    <span>Toque no botão <strong>Compartilhar</strong> na barra inferior do navegador.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="bg-zinc-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">2</span>
                    <span>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="bg-zinc-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">3</span>
                    <span>Confirme tocando em <strong>Adicionar</strong>.</span>
                </li>
            </ol>
            <button onClick={() => setShowIOSInstructions(false)} className="mt-2 bg-lime-500 text-zinc-900 py-2 px-4 rounded-lg font-bold">Entendi</button>
        </div>
    </Modal>
   </>
  );
}
