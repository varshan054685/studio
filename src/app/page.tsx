
"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  CalendarDays
} from "lucide-react";
import { MOCK_TRANSACTIONS, MOCK_BUDGETS } from "@/app/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, Area, AreaChart, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const totalSpend = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);
  const monthlyBudget = MOCK_BUDGETS.reduce((sum, b) => sum + b.monthlyLimit, 0);
  
  const barChartData = MOCK_BUDGETS.map(b => ({
    name: b.category,
    value: b.currentSpent
  }));

  const trendData = [
    { date: 'Oct 01', amount: 120 },
    { date: 'Oct 05', amount: 340 },
    { date: 'Oct 10', amount: 280 },
    { date: 'Oct 15', amount: 450 },
    { date: 'Oct 20', amount: 590 },
    { date: 'Oct 25', amount: 420 },
    { date: 'Oct 30', amount: 680 },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Your financial landscape at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-muted/50 rounded-xl border border-white/5 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>October 2023</span>
          </div>
          <Link href="/insights" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold font-headline rounded-xl shadow-[0_0_20px_rgba(186,156,255,0.3)] hover:scale-105 transition-all">
            <Sparkles className="h-4 w-4" />
            <span>AI Analyze</span>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Spending" 
          value={`$${totalSpend.toLocaleString()}`} 
          change="+12.5%" 
          trend="up" 
          icon={CreditCard} 
          colorClass="text-primary"
        />
        <StatCard 
          title="Daily Average" 
          value={`$${(totalSpend / 30).toFixed(2)}`} 
          change="-2.4%" 
          trend="down" 
          icon={TrendingDown} 
          colorClass="text-accent"
        />
        <StatCard 
          title="Remaining Balance" 
          value={`$${(monthlyBudget - totalSpend).toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="text-emerald-400"
        />
        <StatCard 
          title="Investment Portfolio" 
          value="$12,450" 
          change="+4.1%" 
          trend="up" 
          icon={TrendingUp} 
          colorClass="text-violet-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenditure Trend */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-headline font-bold mb-1">Expenditure Trend</h2>
              <p className="text-sm text-muted-foreground">Cash flow over the last 30 days</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-headline font-bold">
              <ArrowUpRight className="h-5 w-5" />
              <span>+18.2%</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500}} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Goals - Quick View */}
        <div className="glass-card rounded-3xl p-8 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold">Goal Trackers</h2>
            <Link href="/goals" className="text-primary text-sm font-bold hover:underline font-headline">ALL GOALS</Link>
          </div>
          <div className="space-y-8">
            {MOCK_BUDGETS.slice(0, 4).map((goal) => {
              const percent = (goal.currentSpent / goal.monthlyLimit) * 100;
              return (
                <div key={goal.category} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-bold block mb-0.5">{goal.category}</span>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-widest">Spending Priority</span>
                    </div>
                    <span className="text-sm font-headline font-bold">
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={percent} 
                      className={cn(
                        "h-2 bg-muted/30", 
                        percent > 90 ? "[&>div]:bg-destructive" : percent > 75 ? "[&>div]:bg-amber-400" : "[&>div]:bg-accent"
                      )} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Category Mix */}
         <div className="glass-card rounded-3xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-headline font-bold">Category Analysis</h2>
              <div className="text-xs text-muted-foreground flex gap-4 uppercase tracking-tighter">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Primary
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Secondary
                </div>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600}} 
                    width={100}
                  />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Recent Feed */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold">Recent Feed</h2>
            <Link href="/transactions" className="flex items-center gap-1 text-primary text-sm font-bold font-headline hover:gap-2 transition-all">
              VIEW HISTORY <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {MOCK_TRANSACTIONS.slice(0, 5).map((t) => (
              <div key={t.id} className="py-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl px-4 -mx-4 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-headline font-bold text-primary text-lg border border-white/5">
                    {t.description[0]}
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-0.5">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t.category} • {t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold text-lg text-foreground">-${t.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
