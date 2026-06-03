"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Zap, Shield, Globe, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProPage() {
  const router = useRouter();

  const features = [
    { icon: Sparkles, title: "Advanced AI", desc: "Predictive spending and deep neural insights." },
    { icon: Zap, title: "Multi-Account Sync", desc: "Connect unlimited bank and credit card accounts." },
    { icon: Layers, title: "Smart Categories", desc: "Custom AI-driven classification rules." },
    { icon: Globe, title: "Global Currency", desc: "Manage finances in any currency with live rates." },
    { icon: Shield, title: "Biometric Lock", desc: "Extra layer of security for your mobile app." },
    { icon: CheckCircle2, title: "Priority Support", desc: "24/7 dedicated human financial experts." }
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto w-full space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="h-3 w-3" /> LUMINA ELITE
        </div>
        <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tight">Financial Mastery.</h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          Unlock the full potential of Lumina AI and take complete control of your wealth with our premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <Card key={i} className="p-8 glass-card border-white/5 hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-10 md:p-16 glass-card border-primary/20 bg-primary/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-6 relative z-10 text-center md:text-left">
          <h2 className="text-4xl font-headline font-bold">Lumina Pro Plan</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Everything in Free
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Unlimited AI Insights
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Export to PDF/Excel
            </li>
          </ul>
          <div className="pt-4">
            <p className="text-4xl font-headline font-bold">₹499 <span className="text-lg text-muted-foreground font-medium">/ month</span></p>
          </div>
        </div>
        
        <div className="w-full md:w-auto space-y-4 text-center">
          <Button className="w-full md:w-64 h-16 rounded-2xl bg-primary text-primary-foreground font-bold font-headline text-xl shadow-[0_0_30px_rgba(186,156,255,0.4)]">
            UPGRADE NOW
          </Button>
          <p className="text-xs text-muted-foreground">30-day money-back guarantee. Cancel anytime.</p>
        </div>

        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
          <Zap className="h-96 w-96 text-primary" />
        </div>
      </Card>
      
      <div className="text-center pt-8">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          Go back to dashboard
        </Button>
      </div>
    </div>
  );
}