
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Menu, X, LayoutDashboard, ReceiptText, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ReceiptText, label: "Transactions", href: "/transactions" },
  { icon: Target, label: "Budget Goals", href: "/goals" },
  { icon: Sparkles, label: "AI Insights", href: "/insights" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Wallet className="text-primary-foreground h-5 w-5" />
        </div>
        <span className="text-xl font-headline font-bold text-foreground tracking-tight">Lumina</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-background border-l border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Wallet className="text-primary-foreground h-5 w-5" />
              </div>
              <span className="text-xl font-headline font-bold">Lumina</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-bold font-headline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/5">
            <Button className="w-full h-12 rounded-2xl bg-accent text-accent-foreground font-bold font-headline">
              UPGRADE TO PRO
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
