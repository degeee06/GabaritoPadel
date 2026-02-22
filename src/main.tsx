import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PWAInstallProvider } from './hooks/usePWAInstall';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Verifica atualizações a cada carregamento
        registration.update();
        console.log('SW registrado:', registration.scope);
      })
      .catch((err) => {
        console.error('Falha ao registrar SW:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PWAInstallProvider>
      <App />
    </PWAInstallProvider>
  </StrictMode>,
);
