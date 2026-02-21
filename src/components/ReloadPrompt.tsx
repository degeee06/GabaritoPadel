import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r)
    },
    onRegisterError(error) {
      console.log('Erro no registro do Service Worker:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-4 w-64 text-white">
      <div className="mb-2 text-sm font-semibold">
        {offlineReady ? <span>App pronto para funcionar offline</span> : <span>Nova versão disponível!</span>}
      </div>
      {needRefresh && (
        <button 
          className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-900 font-bold py-2 px-3 rounded-md text-sm mb-2"
          onClick={() => updateServiceWorker(true)}
        >
          Atualizar
        </button>
      )}
      <button className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-1 px-3 rounded-md text-xs" onClick={() => close()}>
        Fechar
      </button>
    </div>
  )
}

export default ReloadPrompt
