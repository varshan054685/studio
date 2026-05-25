
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  colorClass?: string;
}

export function StatCard({ title, value, change, trend, icon: Icon, colorClass }: StatCardProps) {
  return (
    <Card className="p-7 glass-card border border-white/5 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl bg-muted/50 border border-white/5 transition-colors group-hover:bg-primary/20", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <div className={cn(
            "text-xs font-headline font-bold px-3 py-1 rounded-full border",
            trend === "down" 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : trend === "up" 
                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                : "bg-muted text-muted-foreground border-white/5"
          )}>
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-headline font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">{title}</p>
        <h3 className="text-3xl font-headline font-bold text-foreground tracking-tight">{value}</h3>
      </div>
      <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Icon className="h-20 w-20" />
      </div>
    </Card>
  );
}
