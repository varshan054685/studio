"use client";

import { Sparkles, BrainCircuit, Lightbulb, AlertTriangle, RefreshCw, BarChart3, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/use-user";
import { useCollection } from "@/lib/use-collection";
import { useInsights } from "@/lib/insights-context";
import type { Transaction, BudgetGoal } from "@/app/lib/types";

export default function InsightsPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const { insights, loading, analyze } = useInsights();

  const { data: transactions, error: txError } = useCollection<Transaction>("transactions", uid);
  const { data: goals, error: goalsError } = useCollection<BudgetGoal>("goals", uid);

  const handleAnalyze = () => analyze(transactions ?? [], goals ?? []);

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full space-y-10">
      {(txError || goalsError) && (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-destructive">
          <h2 className="text-xl font-bold mb-1">Unable to load insight data</h2>
          <p>{txError?.message || goalsError?.message}</p>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">AI Intelligence</h1>
          <p className="text-muted-foreground text-lg">Machine learning analysis of your spending behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !transactions?.length}
            className="rounded-xl bg-primary text-primary-foreground font-bold font-headline hover:bg-primary/90 gap-2 h-12 px-6 shadow-[0_0_25px_rgba(186,156,255,0.4)] transition-all"
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {insights ? "REFRESH AI" : "GENERATE REPORT"}
          </Button>
        </div>
      </header>

      {!insights && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 transform rotate-6 hover:rotate-0 transition-transform cursor-pointer">
            <BrainCircuit className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-headline font-bold mb-4 tracking-tight">Unlock Deep Insights</h2>
          <p className="text-muted-foreground max-w-lg mb-10 text-lg leading-relaxed">
            Our neural analysis tool scans your history to discover patterns,
            detect leaks, and build a personalized path to your financial goals.
          </p>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!transactions?.length}
            className="rounded-2xl px-12 h-14 text-lg font-headline font-bold bg-foreground text-background hover:scale-105 transition-all disabled:opacity-50"
          >
            {transactions?.length ? "ANALYZE MY DATA" : "ADD TRANSACTIONS FIRST"}
          </Button>
        </div>
      )}

      {loading && !insights && (
        <div className="space-y-8 animate-pulse">
          <Skeleton className="h-56 w-full rounded-3xl bg-white/5 border border-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-3xl bg-white/5 border border-white/5" />
            <Skeleton className="h-80 w-full rounded-3xl bg-white/5 border border-white/5" />
          </div>
          <Skeleton className="h-48 w-full rounded-3xl bg-white/5 border border-white/5" />
        </div>
      )}

      {insights && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          <Card className="p-10 glass-card border-primary/30 bg-primary/5 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Zap className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-headline font-bold">The Verdict</h2>
            </div>
            <p className="text-xl leading-relaxed text-foreground/90 font-medium tracking-tight italic">"{insights.overallInsights}"</p>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Sparkles className="h-48 w-48 text-primary" />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 glass-card border-white/5 relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Risk Radar</h3>
              </div>
              <ul className="space-y-5">
                {insights.anomaliesDetected.map((item, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-foreground/80 bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-red-500/20 transition-all">
                    <div className="h-2 w-2 rounded-full bg-red-400 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
                {insights.anomaliesDetected.length === 0 && (
                  <div className="flex flex-col items-center py-8 text-muted-foreground/40">
                    <BarChart3 className="h-10 w-10 mb-2" />
                    <p className="text-sm font-headline italic">No significant anomalies detected.</p>
                  </div>
                )}
              </ul>
            </Card>

            <Card className="p-8 glass-card border-white/5 relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Optimization</h3>
              </div>
              <ul className="space-y-5">
                {insights.budgetOptimizationTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-foreground/80 bg-accent/5 p-4 rounded-2xl border border-accent/10 group-hover:border-accent/30 transition-all">
                    <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0 shadow-[0_0_10px_rgba(129,157,255,0.5)]" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-headline font-bold px-4">Category Deep Dive</h3>
            <div className="grid grid-cols-1 gap-6">
              {insights.categoryInsights.map((cat, idx) => (
                <Card key={idx} className="p-8 glass-card border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-headline font-bold text-2xl text-primary">{cat.category}</h4>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">{cat.analysis}</p>
                    </div>
                    <div className="md:w-2/5 flex flex-col gap-3">
                      <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground mb-1">Recommended Actions</p>
                      {cat.recommendations.map((rec, rIdx) => (
                        <div key={rIdx} className="text-xs font-bold px-4 py-3 bg-white/5 rounded-xl text-foreground/80 border border-white/10 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all flex items-center gap-3">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
