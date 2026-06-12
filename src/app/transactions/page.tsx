
"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Download,
  Sparkles,
  RefreshCw,
  Trash2
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
  DialogDescription,
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
import { formatCurrency } from "@/lib/utils";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/app/lib/types";

export default function TransactionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const uid = user?.uid;

  const transactionsQuery = useMemo(
    () =>
      uid
        ? query(
            collection(db, 'users', uid, 'transactions'),
            orderBy('date', 'desc')
          )
        : null,
    [db, uid]
  );

  const { data: transactions, loading, error } = useCollection<Transaction>(transactionsQuery);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      toast({
        variant: "destructive",
        title: "Categorization Failed",
        description: "AI service is currently busy.",
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!user) return;

    const description = newDesc.trim();
    const amount = Number(newAmount);

    if (!description || !Number.isFinite(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Entry",
        description: "Enter a description and an amount greater than zero.",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        date: new Date().toISOString().split('T')[0],
        description,
        amount,
        category: newCategory,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewDesc("");
      setNewAmount("");
      setNewCategory("Other");
      toast({
        title: "Transaction Logged",
        description: `${description} added successfully.`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Save Error", description: message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      toast({ title: "Removed", description: "Transaction deleted." });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Error", description: message });
    }
  };

  const handleExport = () => {
    const dataToExport = filteredTransactions.length ? filteredTransactions : transactions ?? [];
    if (dataToExport.length === 0) {
      toast({ variant: "destructive", title: "Nothing to export", description: "Add transactions before exporting." });
      return;
    }

    const csvRows = [
      ["Date", "Description", "Category", "Amount"],
      ...dataToExport.map((t) => [
        t.date,
        t.description.replace(/"/g, '""'),
        t.category,
        t.amount.toString(),
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lumina-transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Export started", description: "Your transactions CSV is downloading." });
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">History</h1>
          <p className="text-muted-foreground text-lg">Detailed feed of all financial activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="gap-2 rounded-xl h-12 bg-muted/30 border-white/5 font-bold font-headline">
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
                <DialogDescription>Record a new transaction manually or use AI tagging.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-8 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="desc" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="desc" 
                      value={newDesc} 
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="e.g. Swiggy Order" 
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
                    <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount (₹)</Label>
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
                        {["Groceries", "Dining", "Transportation", "Entertainment", "Shopping", "Utilities", "Rent", "Health", "Other"].map(cat => (
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
            placeholder="Search transactions..." 
            className="pl-12 bg-muted/20 border-white/5 rounded-2xl h-14 focus:border-primary/30 transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Feed */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        {loading ? (
          <div className="p-10 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="p-10 text-center text-destructive">
            <h2 className="text-xl font-bold mb-2">Unable to load transactions</h2>
            <p>{error.message || 'Permission denied while reading your transaction history.'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30 border-none">
              <TableRow className="border-b border-white/5">
                <TableHead className="font-headline font-bold text-muted-foreground h-14 px-8 uppercase tracking-widest text-[10px]">Date</TableHead>
                <TableHead className="font-headline font-bold text-muted-foreground h-14 uppercase tracking-widest text-[10px]">Description</TableHead>
                <TableHead className="font-headline font-bold text-muted-foreground h-14 uppercase tracking-widest text-[10px]">Category</TableHead>
                <TableHead className="font-headline font-bold text-muted-foreground h-14 text-right px-8 uppercase tracking-widest text-[10px]">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="px-8 text-muted-foreground font-medium text-sm">{t.date}</TableCell>
                  <TableCell className="font-bold text-foreground py-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-primary font-headline text-xs">
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
                    -{formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                      <Search className="h-12 w-12 opacity-20" />
                      <p className="font-medium">No transactions found. Add some above!</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
