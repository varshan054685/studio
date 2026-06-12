"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth, useCollection, useFirestore } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Zap,
  LogOut,
  ChevronRight,
  Crown,
  Share2,
  Loader2,
  Bell,
  Globe,
  Coins,
  Lock,
  Smartphone,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { signOut, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { collection, query } from "firebase/firestore";
import { Transaction, BudgetGoal } from "@/app/lib/types";

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const uid = user?.uid;

  const transactionsQuery = useMemo(
    () => (uid ? query(collection(db, "users", uid, "transactions")) : null),
    [db, uid]
  );

  const goalsQuery = useMemo(
    () => (uid ? query(collection(db, "users", uid, "goals")) : null),
    [db, uid]
  );

  const { data: transactions } = useCollection<Transaction>(transactionsQuery);
  const { data: goals } = useCollection<BudgetGoal>(goalsQuery);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setPhotoURL(user?.photoURL ?? "");
  }, [user]);

  const currentDisplayName = displayName || user?.displayName || user?.email?.split('@')[0] || "Anonymous";
  const currentPhotoURL = photoURL || user?.photoURL || undefined;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "Safe travels!" });
      router.push('/login');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Error", description: message });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      });
      toast({ title: "Profile Updated", description: "Your account details are now current." });
      setIsEditing(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ variant: "destructive", title: "Update Failed", description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto w-full space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">Account</h1>
          <p className="text-muted-foreground text-lg">Manage your identity and Lumina settings.</p>
        </div>
        <Badge variant="outline" className="w-fit h-fit px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          Member since {memberSince}
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Brief Profile */}
        <div className="space-y-6">
          <Card className="p-8 glass-card border-white/5 flex flex-col items-center text-center space-y-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent" />
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl relative z-10">
              <AvatarImage src={currentPhotoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="relative z-10">
              <h2 className="text-2xl font-headline font-bold">{currentDisplayName}</h2>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5 mt-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
            </div>
            <div className="w-full pt-6 border-t border-white/5 space-y-4 relative z-10">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                 <span className="flex items-center gap-1"><Crown className="h-3 w-3" /> Member Tier</span>
                 <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">Explorer</span>
               </div>
               <Button onClick={() => router.push('/pro')} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold font-headline h-12 rounded-xl group border-none">
                 UPGRADE TO ELITE <Zap className="ml-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
               </Button>
            </div>
          </Card>

          <Card className="p-6 glass-card border-white/5 space-y-4">
            <h4 className="text-sm font-headline font-bold text-foreground uppercase tracking-wider">Quick Actions</h4>
            <div className="space-y-1">
              <Button variant="ghost" onClick={() => toast({ title: "Privacy Settings", description: "Privacy settings are coming soon." })} className="w-full justify-between h-12 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground group">
                <span className="flex items-center gap-3"><Shield className="h-4 w-4" /> Privacy Settings</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" onClick={() => toast({ title: "Share Profile", description: "Sharing features are coming soon." })} className="w-full justify-between h-12 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground group">
                <span className="flex items-center gap-3"><Share2 className="h-4 w-4" /> Share Progress</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 glass-card border-white/5">
            <h4 className="text-sm font-headline font-bold text-foreground uppercase tracking-wider mb-4">Lumina Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-2xl border border-white/5">
                <p className="text-2xl font-headline font-bold">{transactions?.length || 0}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transactions</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl border border-white/5">
                <p className="text-2xl font-headline font-bold">{goals?.length || 0}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Goals</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start bg-muted/20 p-1 h-auto rounded-2xl border border-white/5 mb-8">
              <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card">Profile</TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card">Security</TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-500">
              <Card className="p-8 glass-card border-white/5">
                <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                  <User className="h-6 w-6 text-primary" /> Profile Details
                </h3>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Full Name</p>
                      <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5">{currentDisplayName || 'Set in Settings'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Email Provider</p>
                      <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2 text-primary font-bold">
                        {user?.providerData[0]?.providerId === 'google.com' ? 'Google Intelligence' : 'Email/Password'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Account UID</p>
                    <code className="block text-xs font-mono p-4 bg-muted/20 rounded-2xl border border-white/5 text-muted-foreground break-all">
                      {user?.uid}
                    </code>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 h-14 rounded-2xl bg-foreground text-background font-bold font-headline hover:bg-foreground/90 transition-transform active:scale-95">
                          EDIT PROFILE
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-white/10 sm:max-w-[500px] p-8">
                        <DialogHeader>
                          <DialogTitle className="font-headline text-3xl font-bold mb-2">Edit Profile</DialogTitle>
                          <DialogDescription>Update your display name and profile photo URL.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid gap-3">
                            <Label htmlFor="display-name">Display Name</Label>
                            <Input
                              id="display-name"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="bg-muted border-none h-12 rounded-xl focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="grid gap-3">
                            <Label htmlFor="photo-url">Photo URL</Label>
                            <Input
                              id="photo-url"
                              value={photoURL}
                              onChange={(e) => setPhotoURL(e.target.value)}
                              className="bg-muted border-none h-12 rounded-xl focus:ring-2 focus:ring-primary"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <DialogFooter className="pt-4">
                          <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="bg-primary text-primary-foreground px-8 font-bold font-headline h-12 rounded-xl"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "SAVE CHANGES"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="flex-1 h-14 rounded-2xl gap-2 font-headline font-bold text-lg shadow-lg shadow-destructive/10 transition-transform active:scale-95"
                    >
                      <LogOut className="h-5 w-5" /> LOG OUT
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-8 glass-card border-primary/20 bg-primary/5 overflow-hidden relative">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-headline font-bold text-primary">Need Financial Advice?</h3>
                  <p className="text-muted-foreground max-w-md">Our premium AI agents can help you optimize your portfolio and plan for early retirement.</p>
                  <Button variant="outline" className="rounded-xl border-primary/30 hover:bg-primary/10" onClick={() => router.push('/pro')}>
                    TALK TO ELITE AI
                  </Button>
                </div>
                <Zap className="absolute -bottom-10 -right-10 h-48 w-48 text-primary/5 pointer-events-none" />
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-8 animate-in fade-in duration-500">
               <Card className="p-8 glass-card border-white/5">
                <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" /> Security & Access
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold">Email Verified</p>
                        <p className="text-xs text-muted-foreground">{user?.emailVerified ? "Your identity is confirmed" : "Verification required"}</p>
                      </div>
                    </div>
                    {!user?.emailVerified && <Button variant="link" className="text-primary h-auto p-0">Verify now</Button>}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">Two-Factor Auth</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Switch disabled />
                  </div>

                  <div className="pt-6">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5">
                      CHANGE PASSWORD
                    </Button>
                  </div>
                </div>
               </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-8 animate-in fade-in duration-500">
              <Card className="p-8 glass-card border-white/5">
                <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" /> App Preferences
                </h3>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Currency</Label>
                    <Select defaultValue="INR">
                      <SelectTrigger className="w-full h-14 bg-muted/30 border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <SelectValue placeholder="Select Currency" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notifications</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Spending Alerts</span>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">AI Weekly Summaries</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
