import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HistoryPage } from './pages/HistoryPage';
import { StrategyForm } from './pages/StrategyForm';
import { StrategyResult } from './pages/StrategyResult';
import { AuthPage } from './pages/AuthPage';
import { MatchInput, TacticalPlan, Match } from './types';
import { generateTacticalPlan, getMatchHistory } from './services/api';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

type ViewState = 'history' | 'form' | 'result';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<ViewState>('history');
  const [plan, setPlan] = useState<TacticalPlan | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
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
  }, [session]);

  const handleFormSubmit = async (input: MatchInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateTacticalPlan(input);
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

  const handleBackToHistory = () => {
    setView('history');
    setPlan(null);
  };

  const renderContent = () => {
    if (loading && view === 'history') {
      return <div className="text-center text-zinc-400">Carregando histórico...</div>;
    }

    switch (view) {
      case 'history':
        return <HistoryPage matches={matches} onMatchSelect={handleSelectMatch} onNewMatch={() => setView('form')} />;
      case 'form':
        return <StrategyForm onBack={handleBackToHistory} onSubmit={handleFormSubmit} loading={loading} />;
      case 'result':
        return plan ? <StrategyResult plan={plan} onBack={handleBackToHistory} /> : null;
      default:
        return <HistoryPage matches={matches} onMatchSelect={handleSelectMatch} onNewMatch={() => setView('form')} />;
    }
  };

  if (!session) {
    return <AuthPage />
  }

  return (
    <Layout>
      {error && <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
      {renderContent()}
    </Layout>
  );
}
