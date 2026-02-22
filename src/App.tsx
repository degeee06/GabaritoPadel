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
import { getUserProfile, incrementUsageCount } from './services/payment';

type ViewState = 'dashboard' | 'history' | 'form' | 'result' | 'guide' | 'serve-guide';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [plan, setPlan] = useState<TacticalPlan | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do Perfil e Pagamento
  const [userProfile, setUserProfile] = useState<{ plan: string, usage_count: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    const profile = await getUserProfile();
    if (profile) setUserProfile(profile);
  };

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

  const handleFormSubmit = async (input: MatchInput) => {
    // Verifica Limite de Uso
    if (userProfile && userProfile.plan !== 'premium' && userProfile.usage_count >= 3) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateTacticalPlan(input);
      
      // Incrementa uso após sucesso
      await incrementUsageCount();
      await fetchProfile(); // Atualiza contador local

      setPlan(result);
      setView('result');
      const historyData = await getMatchHistory();
      setMatches(historyData as Match[]);
    } catch (error) {
      console.error("Failed to generate plan", error);
      setError("Erro ao gerar estratégia. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectMatch = (match: Match) => {
    setPlan(match.tactical_plan);
    setView('result');
  };

  const handleNavigation = (targetView: ViewState) => {
    setView(targetView);
    setPlan(null);
  };

  const handleMatchDeleted = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
  };

  const handleUpgradeSuccess = async () => {
    setShowUpgradeModal(false);
    await fetchProfile();
    alert("Parabéns! Você agora é Premium. Aproveite análises ilimitadas!");
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardPage 
          onStartAnalysis={() => handleNavigation('form')} 
          onViewHistory={() => handleNavigation('history')} 
          onViewGuide={() => handleNavigation('guide')}
          onViewServeGuide={() => handleNavigation('serve-guide')}
        />;
      case 'history':
        if (loading) return <div className="text-center text-zinc-400">Carregando histórico...</div>;
        return <HistoryPage matches={matches} onMatchSelect={handleSelectMatch} onNewMatch={() => handleNavigation('form')} onMatchDeleted={handleMatchDeleted} />;
      case 'form':
        return <StrategyForm onBack={() => handleNavigation('dashboard')} onSubmit={handleFormSubmit} loading={loading} />;
      case 'result':
        return plan ? <StrategyResult plan={plan} onBack={() => handleNavigation('history')} /> : null;
      case 'guide':
        return <PositionGuide onBack={() => handleNavigation('dashboard')} />;
      case 'serve-guide':
        return <ServeGuide onBack={() => handleNavigation('dashboard')} />;
      default:
        return <DashboardPage 
          onStartAnalysis={() => handleNavigation('form')} 
          onViewHistory={() => handleNavigation('history')} 
          onViewGuide={() => handleNavigation('guide')}
          onViewServeGuide={() => handleNavigation('serve-guide')}
        />;
    }
  };

  if (!session) {
    return <AuthPage />
  }

  return (
    <Layout>
      {error && <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
      
      {/* Mostra contador de uso para usuários Free */}
      {userProfile && userProfile.plan !== 'premium' && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 mb-4 flex justify-between items-center text-xs text-zinc-400">
          <span>Análises Diárias: <span className="text-lime-400 font-bold">{Math.max(0, 3 - userProfile.usage_count)}</span> restantes</span>
          <button onClick={() => setShowUpgradeModal(true)} className="text-lime-400 hover:underline">Fazer Upgrade</button>
        </div>
      )}

      {renderContent()}

      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)} 
          onSuccess={handleUpgradeSuccess} 
        />
      )}
    </Layout>
  );
}
