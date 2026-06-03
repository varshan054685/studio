
"use client";

import { useUser, useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Zap, LogOut } from "lucide-react";
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
      toast({ title: "Logged out", description: "See you later!" });
      router.push('/login');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-10">
      <header>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground text-lg">Manage your account and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 glass-card border-white/5 flex flex-col items-center text-center space-y-6 h-fit">
          <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl">
            <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/alex/200/200"} />
            <AvatarFallback className="text-4xl">{user?.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-headline font-bold">{user?.displayName || user?.email?.split('@')[0]}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
          <div className="w-full pt-4 border-t border-white/5 space-y-3">
             <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
               <span>Membership</span>
               <span className="text-primary">FREE TIER</span>
             </div>
             <Button onClick={() => router.push('/pro')} className="w-full bg-primary text-primary-foreground font-bold font-headline h-12 rounded-xl">
               UPGRADE ACCOUNT
             </Button>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-8">
          <Card className="p-8 glass-card border-white/5 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Display Name</p>
                  <p className="font-medium">{user?.displayName || 'Not Set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                  <p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> {user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" /> Security
              </h3>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-white/5">
                <div>
                  <p className="font-bold">Password</p>
                  <p className="text-sm text-muted-foreground">Update your security credentials</p>
                </div>
                <Button variant="outline" className="rounded-xl">CHANGE</Button>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="w-full h-14 rounded-2xl gap-2 font-headline font-bold text-lg"
              >
                <LogOut className="h-5 w-5" /> LOG OUT OF LUMINA
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
