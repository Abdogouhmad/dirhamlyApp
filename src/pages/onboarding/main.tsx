"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, ArrowRight, Wallet, TrendingUp, ShieldCheck, Globe, Calculator, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import currency from "currency.js";

const SUPPORTED_CURRENCIES = [
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("MAD");
  const [loading, setLoading] = useState(false);

  // Converter state
  const [convAmount, setConvertAmount] = useState("100");
  const [fromCurr, setFromCurr] = useState("MAD");
  const [toCurr, setToCurr] = useState("USD");
  const [result, setResult] = useState<string>("");

  // Simple mock conversion rates for the onboarding tool
  const rates: Record<string, number> = {
    MAD: 1,
    USD: 0.1,
    EUR: 0.092,
    GBP: 0.078,
    JPY: 15.1,
    CAD: 0.14,
  };

  useEffect(() => {
    const fromRate = rates[fromCurr] || 1;
    const toRate = rates[toCurr] || 1;
    const amt = parseFloat(convAmount) || 0;
    const converted = (amt / fromRate) * toRate;
    setResult(currency(converted, { symbol: "", precision: 2 }).format());
  }, [convAmount, fromCurr, toCurr]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    if (!name.trim()) {
      toast.error("Name is required", { description: "Please tell us your name." });
      return;
    }
    setLoading(true);
    try {
      await invoke("set_profile", { name, image, currency: selectedCurrency });
      toast.success("Profile created!", { description: `Welcome to Dirhamly, ${name}!` });
      onComplete();
    } catch (err: any) {
      toast.error("Failed to save profile", { description: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Welcome to Dirhamly",
      description: "Your premium financial operating system for modern wealth management.",
      icon: Wallet,
      content: (
        <div className="grid grid-cols-1 gap-4 mt-6">
          <FeatureItem icon={TrendingUp} title="Real-time Tracking" desc="Monitor your income and expenses with precision." />
          <FeatureItem icon={ShieldCheck} title="Privacy First" desc="Your data is stored locally and securely on your device." />
        </div>
      )
    },
    {
      title: "Personalize Your Space",
      description: "How should we call you?",
      icon: Camera,
      content: (
        <div className="space-y-6 mt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-cobalt-500/30 shadow-2xl">
                <AvatarImage src={image || ""} />
                <AvatarFallback className="bg-cobalt-500/10 text-cobalt-400 text-2xl font-bold">
                  {name.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-2 bg-cobalt-500 rounded-full cursor-pointer shadow-lg hover:bg-cobalt-600 transition-colors"
              >
                <Camera className="h-4 w-4 text-white" />
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Upload a profile picture</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Your Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Abderrahman" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
        </div>
      )
    },
    {
      title: "Currency & Localization",
      description: "Select your primary currency and try our converter.",
      icon: Globe,
      content: (
        <div className="space-y-8 mt-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Default Currency</Label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="h-14 rounded-2xl bg-white/[0.03] border-white/5 backdrop-blur-md px-4">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-3xl">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="h-11 rounded-xl">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-white/5 px-2 py-0.5 rounded text-cobalt-400">{c.code}</span>
                      <span className="font-medium text-sm">{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="size-4 text-cobalt-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Quick Converter</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Input 
                  type="number" 
                  value={convAmount} 
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="h-12 text-lg font-bold bg-white/[0.03]"
                />
                <Select value={fromCurr} onValueChange={setFromCurr}>
                   <SelectTrigger className="w-24 h-12 rounded-xl bg-white/5 border-none">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="backdrop-blur-3xl rounded-xl">
                      {SUPPORTED_CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                   </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center py-1">
                 <div className="p-2 rounded-full bg-cobalt-500/10 text-cobalt-400">
                    <ArrowLeftRight className="size-4" />
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-12 flex items-center px-4 bg-white/[0.05] rounded-xl border border-white/5 text-lg font-black text-cobalt-400">
                   {result}
                </div>
                <Select value={toCurr} onValueChange={setToCurr}>
                   <SelectTrigger className="w-24 h-12 rounded-xl bg-white/5 border-none">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="backdrop-blur-3xl rounded-xl">
                      {SUPPORTED_CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                   </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-cobalt-500/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-cobalt-400 to-cobalt-600 flex items-center justify-center text-white shadow-xl shadow-cobalt-500/20 mb-4">
                <currentStep.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">{currentStep.title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground/80 mt-2">{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep.content}
              <div className="mt-8 flex flex-col gap-3">
                {step < steps.length ? (
                  <Button size="lg" className="w-full h-12 text-base font-semibold rounded-xl" onClick={() => setStep(step + 1)}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg" className="w-full h-12 text-base font-semibold rounded-xl" onClick={handleFinish} disabled={loading}>
                    {loading ? "Creating Profile..." : "Complete Setup"}
                  </Button>
                )}
                {step > 1 && (
                  <Button variant="ghost" className="w-full" onClick={() => setStep(step - 1)} disabled={loading}>
                    Go Back
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === i + 1 ? "w-8 bg-cobalt-500" : "w-2 bg-white/10"
                )} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05]">
      <div className="mt-1 p-2 rounded-xl bg-cobalt-500/10 text-cobalt-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-bold text-foreground tracking-tight">{title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
