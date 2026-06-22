'use client';

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { getAISpendingInsights, type AISpendingInsightsOutput } from '@/ai/flows/ai-spending-insights-flow';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, BudgetGoal } from '@/app/lib/types';

interface InsightsContextValue {
  insights: AISpendingInsightsOutput | null;
  loading: boolean;
  analyze: (transactions: Transaction[], goals: BudgetGoal[]) => void;
}

const InsightsContext = createContext<InsightsContextValue | null>(null);

export function InsightsProvider({ children }: { children: ReactNode }) {
  const [insights, setInsights] = useState<AISpendingInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const runningRef = useRef(false);
  const { toast } = useToast();

  const analyze = useCallback((transactions: Transaction[], goals: BudgetGoal[]) => {
    if (runningRef.current) return;
    if (!transactions.length) {
      toast({ variant: 'destructive', title: 'No Data', description: 'Add some transactions before generating insights.' });
      return;
    }
    runningRef.current = true;
    setLoading(true);

    getAISpendingInsights({
      transactions: transactions.map(t => ({ date: t.date, description: t.description, amount: t.amount, category: t.category })),
      budgetGoals: goals.map(b => ({ category: b.category, monthlyLimit: b.monthly_limit })),
      summaryPeriod: 'last month',
    })
      .then((data) => {
        setInsights(data);
        toast({ title: 'Analysis Complete', description: 'AI has processed your financial data.' });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        const is503 = message.includes('503') || message.includes('high demand');
        toast({
          variant: 'destructive',
          title: is503 ? 'AI Service Busy' : 'Analysis Failed',
          description: is503 ? 'High demand — please retry in a few seconds.' : message,
        });
      })
      .finally(() => {
        setLoading(false);
        runningRef.current = false;
      });
  }, [toast]);

  return (
    <InsightsContext.Provider value={{ insights, loading, analyze }}>
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  const ctx = useContext(InsightsContext);
  if (!ctx) throw new Error('useInsights must be used within InsightsProvider');
  return ctx;
}
