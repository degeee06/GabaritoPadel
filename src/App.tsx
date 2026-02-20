/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { StrategyForm } from './pages/StrategyForm';
import { StrategyResult } from './pages/StrategyResult';
import { MatchInput, TacticalPlan } from './types';
import { generateTacticalPlan } from './services/api';

type ViewState = 'dashboard' | 'form' | 'result';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [plan, setPlan] = useState<TacticalPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setView('form');
  };

  const handleFormSubmit = async (input: MatchInput) => {
    setLoading(true);
    try {
      const result = await generateTacticalPlan(input);
      setPlan(result);
      setView('result');
    } catch (error) {
      console.error("Failed to generate plan", error);
      // In a real app, show a toast or error message
      alert("Erro ao gerar estratégia. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setPlan(null);
  };

  const handleBackToForm = () => {
    setView('form');
  };

  return (
    <Layout>
      {view === 'dashboard' && (
        <Dashboard onStart={handleStart} />
      )}

      {view === 'form' && (
        <StrategyForm 
          onBack={handleBackToDashboard} 
          onSubmit={handleFormSubmit} 
          loading={loading} 
        />
      )}

      {view === 'result' && plan && (
        <StrategyResult 
          plan={plan} 
          onBack={handleBackToForm} 
        />
      )}
    </Layout>
  );
}

