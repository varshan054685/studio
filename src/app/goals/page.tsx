
"use client";

import { useState, useMemo, useEffect } from "react";
import { Target, Plus, DollarSign, CheckCircle2, Trash2 } from "lucide-react";
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
import { cn, formatCurrency } from "@/lib/utils";
import { useUser } from "@/lib/use-user";
import { useCollection } from "@/lib/use-collection";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import type { BudgetGoal } from "@/app/lib/types";

const MAX_CATEGORY_LENGTH = 80;
const MAX_AMOUNT = 100000000;

export default function GoalsPage() {
  const { user } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState<(BudgetGoal & { id: string }) | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingLimit, setEditingLimit] = useState("");
  const [editingSpent, setEditingSpent] = useState("");
  const { toast } = useToast();
  const uid = user?.uid;

  useEffect(() => {
    if (editingGoal) {
      setEditingCategory(editingGoal.category);
      setEditingLimit(editingGoal.monthly_limit.toString());
      setEditingSpent(editingGoal.current_spent.toString());
    }
  }, [editingGoal]);

  const { data: goals, loading, error, refetch } = useCollection<BudgetGoal>(
    'goals',
    uid
  );

  const handleAddGoal = async () => {
    if (!user) return;

    const category = newCat.trim();
    const monthly_limit = Number(newLimit);

    if (
      !category ||
      category.length > MAX_CATEGORY_LENGTH ||
      !Number.isFinite(monthly_limit) ||
      monthly_limit <= 0 ||
      monthly_limit > MAX_AMOUNT
    ) {
      toast({
        variant: "destructive",
        title: "Invalid Goal",
        description: "Enter a short category and a limit between 0 and 100,000,000.",
      });
      return;
    }

    try {
      const { error: insertError } = await supabase.from('goals').insert({
        user_id: user.uid,
        category,
        monthly_limit: monthly_limit,
        current_spent: 0,
      });
      if (insertError) throw insertError;

      setIsAdding(false);
      setNewCat("");
      setNewLimit("");
      await refetch();
      toast({
        title: "Goal Established",
        description: `Target for ${category} is now active.`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Save Error", description: message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error: deleteError } = await supabase.from('goals').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await refetch();
      toast({ title: "Removed", description: "Goal deleted." });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Error", description: message });
    }
  };

  const handleOpenAdjust = (goal: BudgetGoal & { id: string }) => {
    setEditingGoal(goal);
    setIsEditing(true);
  };

  const handleUpdateGoal = async () => {
    if (!user || !editingGoal) return;

    const category = editingCategory.trim();
    const monthly_limit = Number(editingLimit);
    const current_spent = Number(editingSpent);

    if (
      !category ||
      category.length > MAX_CATEGORY_LENGTH ||
      !Number.isFinite(monthly_limit) ||
      monthly_limit <= 0 ||
      monthly_limit > MAX_AMOUNT ||
      !Number.isFinite(current_spent) ||
      current_spent < 0 ||
      current_spent > MAX_AMOUNT
    ) {
      toast({
        variant: "destructive",
        title: "Invalid Goal",
        description: "Enter a short category, a valid limit, and a spent amount from 0 to 100,000,000.",
      });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          category,
          monthly_limit: monthly_limit,
          current_spent: current_spent,
        })
        .eq('id', editingGoal.id);
      if (updateError) throw updateError;

      await refetch();
      toast({ title: "Goal Updated", description: `Budget goal for ${category} has been adjusted.` });
      setIsEditing(false);
      setEditingGoal(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Update Failed", description: message });
    }
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
              <DialogDescription>
                Define a monthly limit for a specific spending category to stay on track.
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
                  maxLength={MAX_CATEGORY_LENGTH}
                  className="bg-muted border-none h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="limit" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Monthly Limit (₹)</Label>
                <Input 
                  id="limit" 
                  type="number"
                  value={newLimit} 
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="10000" 
                  max={MAX_AMOUNT}
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
        </div>
      ) : error ? (
        <div className="col-span-full rounded-3xl border border-destructive/20 bg-destructive/10 p-8 text-destructive">
          <h2 className="text-xl font-bold mb-2">Unable to load goals</h2>
          <p>{error.message || 'Permission denied while reading your budget goals.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals?.map((budget) => {
            const percent = (budget.current_spent / budget.monthly_limit) * 100 || 0;
            const isOver = budget.current_spent > budget.monthly_limit;
            const remaining = Math.max(0, budget.monthly_limit - budget.current_spent);
            
            return (
              <Card key={budget.id} className="p-8 glass-card border border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
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
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <h3 className="text-2xl font-headline font-bold mb-2 group-hover:text-primary transition-colors">{budget.category}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{formatCurrency(budget.current_spent)} of {formatCurrency(budget.monthly_limit)} spent</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className={isOver ? 'text-destructive' : 'text-primary'}>{Math.round(percent)}% UTILIZED</span>
                    <span className="text-muted-foreground">{isOver ? 'OVER LIMIT' : `${formatCurrency(remaining)} LEFT`}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, percent)} 
                    className={cn(
                      "h-2.5 bg-muted/30", 
                      isOver ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'
                    )} 
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => handleOpenAdjust(budget)} className="flex-1 rounded-xl py-6 border border-white/5 hover:bg-white/5 font-bold font-headline text-xs uppercase tracking-widest transition-all">
                    ADJUST
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)} className="rounded-xl h-12 w-12 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                {percent < 80 && percent > 0 && (
                  <div className="absolute top-0 right-0 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                )}
              </Card>
            );
          })}
          {goals?.length === 0 && (
            <div className="col-span-full py-24 text-center glass-card rounded-3xl border border-dashed border-white/10">
              <p className="text-muted-foreground italic">No budget targets set. Create your first goal to start tracking!</p>
            </div>
          )}
        </div>
      )}
      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setEditingGoal(null);
        }
      }}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[500px] p-8">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl font-bold mb-2">Adjust Goal</DialogTitle>
            <DialogDescription>Update the selected budget goal details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value)}
                maxLength={MAX_CATEGORY_LENGTH}
                className="bg-muted border-none h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="edit-limit">Monthly Limit</Label>
              <Input
                id="edit-limit"
                type="number"
                value={editingLimit}
                onChange={(e) => setEditingLimit(e.target.value)}
                max={MAX_AMOUNT}
                className="bg-muted border-none h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="edit-spent">Current Spent</Label>
              <Input
                id="edit-spent"
                type="number"
                value={editingSpent}
                onChange={(e) => setEditingSpent(e.target.value)}
                max={MAX_AMOUNT}
                className="bg-muted border-none h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={() => {
              setIsEditing(false);
              setEditingGoal(null);
            }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleUpdateGoal} className="bg-primary text-primary-foreground px-8 font-bold font-headline h-12 rounded-xl">SAVE CHANGES</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
