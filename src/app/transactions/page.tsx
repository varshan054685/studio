
"use client";

import { useState, useMemo } from "react";
import { MOCK_TRANSACTIONS } from "@/app/lib/mock-data";
import { Transaction } from "@/app/lib/types";
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown,
  ArrowUpDown,
  Download,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { categorizeTransaction } from "@/ai/flows/automatic-transaction-categorization-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isAdding, setIsAdding] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Uncategorized");
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm]);

  const handleAutoCategorize = async () => {
    if (!newDesc) return;
    setIsCategorizing(true);
    try {
      const result = await categorizeTransaction({ transactionDescription: newDesc });
      setNewCategory(result.category);
      toast({
        title: "AI Analysis Complete",
        description: `Smart tagged as "${result.category}"`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleAddTransaction = () => {
    if (!newDesc || !newAmount) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      description: newDesc,
      amount: parseFloat(newAmount),
      category: newCategory
    };
    setTransactions([newTx, ...transactions]);
    setIsAdding(false);
    setNewDesc("");
    setNewAmount("");
    setNewCategory("Uncategorized");
    toast({
      title: "Transaction Logged",
      description: `${newDesc} added successfully.`,
    });
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">History</h1>
          <p className="text-muted-foreground text-lg">Detailed feed of all financial activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl h-12 bg-muted/30 border-white/5 font-bold font-headline">
            <Download className="h-4 w-4" /> EXPORT
          </Button>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-12 bg-primary text-primary-foreground font-bold font-headline px-6 shadow-[0_0_20px_rgba(186,156,255,0.3)]">
                <Plus className="h-4 w-4" /> ADD ENTRY
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 sm:max-w-[500px] p-8">
              <DialogHeader>
                <DialogTitle className="font-headline text-3xl font-bold mb-2">New Expense</DialogTitle>
                <p className="text-muted-foreground text-sm">Capture transaction details and use AI for instant tagging.</p>
              </DialogHeader>
              <div className="grid gap-8 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="desc" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="desc" 
                      value={newDesc} 
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="e.g. Starbucks Reserve" 
                      className="bg-muted border-none h-12 rounded-xl"
                    />
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      onClick={handleAutoCategorize}
                      disabled={!newDesc || isCategorizing}
                      className="rounded-xl h-12 w-12 shrink-0 bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                      title="Auto-categorize"
                    >
                      {isCategorizing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount ($)</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      value={newAmount} 
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00" 
                      className="bg-muted border-none h-12 rounded-xl font-headline font-bold text-lg"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="category" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="bg-muted border-none h-12 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {["Groceries", "Dining", "Transportation", "Entertainment", "Shopping", "Utilities", "Rent", "Other"].map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAddTransaction} className="bg-primary text-primary-foreground px-8 font-bold font-headline h-12 rounded-xl">SAVE ENTRY</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search merchants, categories, or notes..." 
            className="pl-12 bg-muted/20 border-white/5 rounded-2xl h-14 focus:border-primary/30 transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-2xl h-14 border-white/5 bg-muted/20 px-6 font-bold font-headline">
            <Calendar className="h-4 w-4 text-primary" /> ALL TIME <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2 rounded-2xl h-14 border-white/5 bg-muted/20 px-6 font-bold font-headline">
            <Filter className="h-4 w-4 text-accent" /> FILTERS <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Feed */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        <Table>
          <TableHeader className="bg-muted/30 border-none">
            <TableRow className="border-b border-white/5">
              <TableHead className="font-headline font-bold text-muted-foreground h-14 px-8 uppercase tracking-widest text-[10px]">Date</TableHead>
              <TableHead className="font-headline font-bold text-muted-foreground h-14 uppercase tracking-widest text-[10px]">Description</TableHead>
              <TableHead className="font-headline font-bold text-muted-foreground h-14 uppercase tracking-widest text-[10px]">Category</TableHead>
              <TableHead className="font-headline font-bold text-muted-foreground h-14 text-right px-8 uppercase tracking-widest text-[10px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((t) => (
              <TableRow key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="px-8 text-muted-foreground font-medium text-sm">{t.date}</TableCell>
                <TableCell className="font-bold text-foreground py-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-primary font-headline text-xs group-hover:scale-110 transition-transform">
                    {t.description[0]}
                  </div>
                  {t.description}
                </TableCell>
                <TableCell>
                  <span className="px-3 py-1.5 rounded-xl bg-accent/10 text-accent text-[11px] font-bold border border-accent/20 uppercase tracking-tighter">
                    {t.category}
                  </span>
                </TableCell>
                <TableCell className="text-right px-8 font-headline font-bold text-xl text-foreground">
                  -${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <Search className="h-12 w-12 opacity-20" />
                    <p className="font-medium">No transactions match your current search.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
