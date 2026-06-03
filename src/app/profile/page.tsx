"use client";

import { useUser, useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Zap, LogOut, ChevronRight } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "Safe travels!" });
      router.push('/login');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full space-y-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">Account</h1>
        <p className="text-muted-foreground text-lg">Manage your identity and Lumina settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Brief Profile */}
        <div className="space-y-6">
          <Card className="p-8 glass-card border-white/5 flex flex-col items-center text-center space-y-6">
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl">
              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-headline font-bold">{user?.displayName || user?.email?.split('@')[0]}</h2>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5 mt-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
            </div>
            <div className="w-full pt-6 border-t border-white/5 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                 <span>Member Tier</span>
                 <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">Explorer</span>
               </div>
               <Button onClick={() => router.push('/pro')} className="w-full bg-primary text-primary-foreground font-bold font-headline h-12 rounded-xl group">
                 UPGRADE TO ELITE <Zap className="ml-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
               </Button>
            </div>
          </Card>

          <Card className="p-6 glass-card border-white/5 space-y-4">
            <h4 className="text-sm font-headline font-bold text-foreground uppercase tracking-wider">Quick Actions</h4>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-between h-12 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground group">
                <span className="flex items-center gap-3"><Shield className="h-4 w-4" /> Privacy Settings</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" className="w-full justify-between h-12 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground group">
                <span className="flex items-center gap-3"><Zap className="h-4 w-4" /> Connected Apps</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 glass-card border-white/5">
            <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
              <User className="h-6 w-6 text-primary" /> Profile Details
            </h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Full Name</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5">{user?.displayName || 'Set in Settings'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Email Provider</p>
                  <p className="text-lg font-medium p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-2">
                    {user?.providerData[0]?.providerId === 'google.com' ? 'Google Intelligence' : 'Email/Password'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Account UID</p>
                <code className="block text-xs font-mono p-4 bg-muted/20 rounded-2xl border border-white/5 text-muted-foreground">
                  {user?.uid}
                </code>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <Button className="flex-1 h-14 rounded-2xl bg-foreground text-background font-bold font-headline hover:bg-foreground/90">
                  EDIT PROFILE
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive" 
                  className="flex-1 h-14 rounded-2xl gap-2 font-headline font-bold text-lg shadow-lg shadow-destructive/10"
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
        </div>
      </div>
    </div>
  );
}
