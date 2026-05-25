"use client";

import { useState } from "react";
import { MOCK_BUDGETS } from "@/app/lib/mock-data";
import { Target, Plus, TrendingUp, DollarSign, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  const [budgets, setBudgets] = useState(MOCK_BUDGETS);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const { toast } = useToast();

  const handleAddGoal = () => {
    if (!newCat || !newLimit) return;
    setBudgets([...budgets, { category: newCat, monthlyLimit: parseFloat(newLimit), currentSpent: 0 }]);
    setIsAdding(false);
    setNewCat("");
    setNewLimit("");
    toast({
      title: "Goal Established",
      description: `Target for ${newCat} is now active.`,
    });
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">Budget Goals</h1>
          <p className="text-muted-foreground text-lg">Define limits and track your efficiency.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 bg-primary text-primary-foreground font-bold font-headline px-6 shadow-[0_0_20px_rgba(186,156,255,0.3)]">
              <Plus className="h-4 w-4" /> CREATE GOAL
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-[450px] p-8">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl font-bold mb-2">Set Target</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Define a monthly limit for a specific spending category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-8 py-6">
              <div className="grid gap-3">
                <Label htmlFor="cat" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                <Input 
                  id="cat" 
                  value={newCat} 
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Fine Dining" 
                  className="bg-muted border-none h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="limit" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Monthly Limit ($)</Label>
                <Input 
                  id="limit" 
                  type="number"
                  value={newLimit} 
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="1000" 
                  className="bg-muted border-none h-12 rounded-xl font-headline font-bold text-xl"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleAddGoal} className="bg-primary text-primary-foreground px-8 font-bold font-headline h-12 rounded-xl">SAVE TARGET</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {budgets.map((budget) => {
          const percent = (budget.currentSpent / budget.monthlyLimit) * 100;
          const isOver = budget.currentSpent > budget.monthlyLimit;
          const remaining = Math.max(0, budget.monthlyLimit - budget.currentSpent);
          
          return (
            <Card key={budget.category} className="p-8 glass-card border border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 rounded-2xl bg-muted/50 border border-white/5 transition-colors group-hover:bg-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-headline font-bold uppercase tracking-[0.2em] mb-1">REMAINING</p>
                  <p className={cn(
                    "text-2xl font-headline font-bold tracking-tight",
                    isOver ? 'text-destructive' : 'text-foreground'
                  )}>
                    ${remaining.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-2xl font-headline font-bold mb-2 group-hover:text-primary transition-colors">{budget.category}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>${budget.currentSpent.toLocaleString()} of ${budget.monthlyLimit.toLocaleString()} spent</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className={isOver ? 'text-destructive' : 'text-primary'}>{Math.round(percent)}% UTILIZED</span>
                  <span className="text-muted-foreground">{isOver ? 'OVER LIMIT' : `$${remaining.toLocaleString()} LEFT`}</span>
                </div>
                <Progress 
                  value={Math.min(100, percent)} 
                  className={cn(
                    "h-2.5 bg-muted/30", 
                    isOver ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'
                  )} 
                />
              </div>

              <Button variant="ghost" className="w-full rounded-xl py-6 border border-white/5 hover:bg-white/5 font-bold font-headline text-xs uppercase tracking-widest transition-all">
                ADJUST BUDGET
              </Button>

              {percent < 80 && (
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
