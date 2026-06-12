
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  Sparkles, 
  Settings,
  Wallet,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ReceiptText, label: "Transactions", href: "/transactions" },
  { icon: Target, label: "Budget Goals", href: "/goals" },
  { icon: Sparkles, label: "AI Insights", href: "/insights" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "See you soon!" });
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: message,
      });
    }
  };

  if (pathname === '/login') return null;

  return (
    <aside className="w-72 border-r border-border bg-card/40 backdrop-blur-xl hidden lg:flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-8 mb-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(186,156,255,0.3)]">
          <Wallet className="text-primary-foreground h-6 w-6" />
        </div>
        <span className="text-2xl font-headline font-bold tracking-tight text-foreground">Lumina</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "group-hover:text-primary")} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {isActive && (
                <div className="h-5 w-1 bg-primary rounded-full absolute right-0" />
              )}
            </Link>
          );
        })}
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
            pathname === "/profile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <UserIcon className="h-5 w-5 group-hover:text-primary" />
          <span className="font-medium text-sm">Account</span>
        </Link>
      </nav>
      
      <div className="p-4 space-y-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-headline font-bold text-primary tracking-widest uppercase mb-1">Elite Status</p>
            <p className="text-xs font-medium text-foreground/80 mb-4 leading-relaxed">Unlock advanced AI predictive analytics and multi-account sync.</p>
            <button 
              onClick={() => router.push('/pro')}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(186,156,255,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              GO PRO
            </button>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-4">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/alex/100/100"} />
              <AvatarFallback>{user?.email?.[0].toUpperCase() || 'L'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={() => router.push('/profile')} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all group"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
