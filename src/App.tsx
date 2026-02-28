import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HistoryPage } from './pages/HistoryPage';
import { StrategyForm } from './pages/StrategyForm';
import { StrategyResult } from './pages/StrategyResult';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { MatchInput, TacticalPlan, Match } from './types';
import { generateTacticalPlan, getMatchHistory } from './services/api';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

import { PositionGuide } from './components/PositionGuide';
import { ServeGuide } from './components/ServeGuide';
import { UpgradeModal } from './components/UpgradeModal';
import { PanicMode } from './components/PanicMode';
import { EquipmentConsultant } from './pages/EquipmentConsultant';
import { getUserProfile, incrementUsageCount } from './services/payment';
import { usePWAInstall } from './hooks/usePWAInstall';

type ViewState = 'dashboard' | 'history' | 'form' | 'result' | 'guide' | 'serve-guide' | 'equipment';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [view, setView] = useState<ViewState>('dashboard');
  const [plan, setPlan] = useState<TacticalPlan | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ plan: string, usage_count: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPanicMode, setShowPanicMode] = useState(false);
  const { installPrompt, triggerInstall } = usePWAInstall();

  useEffect(() => {
    // Detecta recuperação na carga inicial
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (hash.includes('type=recovery') || searchParams.has('code')) {
      setIsRecovering(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && view === 'history') {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const historyData = await getMatchHistory();
          setMatches(historyData as Match[]);
        } catch (err) {
          setError('Falha ao carregar o histórico.');
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [session, view]);

  const fetchProfile = async () => {
    const profile = await getUserProfile();
    if (profile) setUserProfile(profile);
  };

  const handleFormSubmit = async (input: MatchInput) => {
    if (userProfile && userProfile.plan !== 'premium' && userProfile.usage_count >= 3) {
      setShowUpgradeModal(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateTacticalPlan(input);
      await incrementUsageCount();
      await fetchProfile();
      setPlan(result);
      setView('result');
      const historyData = await getMatchHistory();
      setMatches(historyData as Match[]);
    } catch (err) {
      setError("Erro ao gerar estratégia.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (targetView: ViewState) => {
    setView(targetView);
    setPlan(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardPage 
          onStartAnalysis={() => handleNavigation('form')} 
          onViewHistory={() => handleNavigation('history')} 
          onViewGuide={() => handleNavigation('guide')}
          onViewServeGuide={() => handleNavigation('serve-guide')}
          onViewEquipment={() => handleNavigation('equipment')}
          onPanicMode={() => setShowPanicMode(true)}
        />;
      case 'history':
        return <HistoryPage matches={matches} onMatchSelect={(m) => { setPlan(m.tactical_plan); setView('result'); }} onNewMatch={() => handleNavigation('form')} onMatchDeleted={(id) => setMatches(matches.filter(m => m.id !== id))} />;
      case 'form':
        return <StrategyForm onBack={() => handleNavigation('dashboard')} onSubmit={handleFormSubmit} loading={loading} />;
      case 'result':
        return plan ? <StrategyResult plan={plan} onBack={() => handleNavigation('history')} /> : null;
      case 'guide':
        return <PositionGuide onBack={() => handleNavigation('dashboard')} />;
      case 'serve-guide':
        return <ServeGuide onBack={() => handleNavigation('dashboard')} />;
      case 'equipment':
        return <EquipmentConsultant onBack={() => handleNavigation('dashboard')} />;
      default:
        return null;
    }
  };

  // Se não houver sessão OU estivermos recuperando a senha, mostra AuthPage
  if (!session || isRecovering) {
    return <AuthPage onRecoveryComplete={() => setIsRecovering(false)} />;
  }

  return (
    <Layout installPrompt={installPrompt} triggerInstall={triggerInstall}>
      {error && <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
      
      {userProfile && userProfile.plan !== 'premium' && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 mb-4 flex justify-between items-center text-xs text-zinc-400">
          <span>Análises Diárias: <span className="text-lime-400 font-bold">{Math.max(0, 3 - userProfile.usage_count)}</span> restantes</span>
          <button onClick={() => setShowUpgradeModal(true)} className="text-lime-400 hover:underline">Fazer Upgrade</button>
        </div>
      )}

      {renderContent()}

      {showPanicMode && (
        <PanicMode onClose={() => setShowPanicMode(false)} />
      )}

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} onSuccess={async () => { setShowUpgradeModal(false); await fetchProfile(); }} />
      )}
    </Layout>
  );
}
