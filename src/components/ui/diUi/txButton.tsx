"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Plus, 
  Calendar as CalendarIcon, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryMeta,
} from "@/lib/txop";
import { motion, Variants } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TxButtonProps {
  onSuccess?: () => Promise<void>;
}

interface DiFormProps {
  onSuccess: () => Promise<void>;
  txType: "income" | "expense";
  setTxType: (type: "income" | "expense") => void;
}

// ─── TxButton ─────────────────────────────────────────────────────────────────

export function TxButton({ onSuccess }: TxButtonProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState<"income" | "expense">("expense");

  const handleSuccess = async () => {
    setOpen(false);
    await onSuccess?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className={cn(
            "transition-all duration-500 relative overflow-hidden group",
            isCollapsed
              ? "h-12 w-12 rounded-2xl p-0 justify-center"
              : "w-full justify-start px-4 rounded-2xl shadow-xl shadow-cobalt-500/20",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cobalt-400 to-cobalt-600 opacity-100 group-hover:scale-105 transition-transform duration-500" />
          <Plus className={cn("size-5 shrink-0 relative z-10 transition-transform duration-300 group-hover:rotate-90", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="relative z-10 font-bold tracking-tight">Add Transaction</span>}
          {!isCollapsed && (
            <div className="absolute right-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles className="size-4" />
            </div>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col border-l border-white/10 bg-background/95 backdrop-blur-3xl sm:max-w-lg overflow-hidden">
        {/* Dynamic Glow Background */}
        <div 
          className={cn(
            "absolute -top-[10%] -right-[10%] w-[50%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000 opacity-20 pointer-events-none",
            txType === "income" ? "bg-jade-500" : "bg-ember-500"
          )} 
        />
        <div 
          className={cn(
            "absolute -bottom-[5%] -left-[5%] w-[40%] h-[30%] blur-[100px] rounded-full transition-colors duration-1000 opacity-10 pointer-events-none",
            txType === "income" ? "bg-cobalt-500" : "bg-gold-500"
          )} 
        />

        <SheetHeader className="pb-8 relative z-10">
          <div className="flex items-center gap-2 mb-1">
             <div className={cn(
               "h-1.5 w-6 rounded-full transition-colors duration-500",
               txType === "income" ? "bg-jade-500" : "bg-ember-500"
             )} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Finance OS • Entry</span>
          </div>
          <SheetTitle className="text-3xl font-black tracking-tighter">
            New {txType === "income" ? "Income" : "Expense"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground/70 font-medium">
            Record your financial movements with precision.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 relative z-10 no-scrollbar">
          {open && <DiForm onSuccess={handleSuccess} txType={txType} setTxType={setTxType} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── DiForm ───────────────────────────────────────────────────────────────────

function DiForm({ onSuccess, txType, setTxType }: DiFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);

  const categories =
    txType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const selectedCategoryMeta = category ? getCategoryMeta(category) : null;

  const handleTxTypeChange = (type: "income" | "expense") => {
    setTxType(type);
    setCategory("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Invalid amount", { description: "Please enter a positive number" });
      return;
    }
    if (!category) {
      toast.error("Category needed", { description: "Please select a category" });
      return;
    }

    setLoading(true);
    try {
      await invoke("add_tx", {
        txType: txType,
        amount,
        category,
        description: description.trim() || null,
        date,
      });

      toast.success("Entry Saved", {
        description: `${txType.toUpperCase()} • ${amount} MAD`,
      });

      await onSuccess();
    } catch (err: any) {
      toast.error("Failed to save", { description: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key for submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [amount, category, description, date, txType]);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: "easeOut" } 
    }
  };

  return (
    <form id="tx-form" onSubmit={handleSubmit} className="space-y-8 pt-2 pb-10">
      <motion.div initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={itemVariants}>
          <TxTypeToggle value={txType} onChange={handleTxTypeChange} />
        </motion.div>

        {/* Clean Amount Input */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Amount</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className={cn(
                "text-2xl font-bold transition-colors duration-300",
                txType === "income" ? "text-jade-500" : "text-ember-500"
              )}>
                {txType === "income" ? "+" : "-"}
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-20 w-full pl-12 pr-16 bg-white/[0.02] border border-white/5 rounded-2xl text-4xl font-bold tracking-tight outline-none focus:border-cobalt-500/30 focus:bg-white/[0.04] transition-all tabular-nums placeholder:text-white/5"
              autoFocus
            />
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <span className="text-sm font-black text-muted-foreground/30 uppercase tracking-widest">MAD</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6">
          {/* Category Selection */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-14 w-full rounded-xl bg-white/[0.02] border-white/5 px-4 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-3">
                  {selectedCategoryMeta ? (
                    <>
                      <div className={cn("p-1.5 rounded-lg", selectedCategoryMeta.color.split(" ")[0])}>
                        <selectedCategoryMeta.icon className={cn("size-4", selectedCategoryMeta.color.split(" ")[1])} />
                      </div>
                      <span className="font-semibold">{selectedCategoryMeta.label}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/40 font-medium">Select a category...</span>
                  )}
                </div>
                {/* Hidden SelectValue to keep Radix happy */}
                <div className="hidden">
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent position="popper" className="rounded-xl border-white/10 bg-background/95 backdrop-blur-3xl p-1 w-[var(--radix-select-trigger-width)]">
                {categories.map((cat) => {
                  const meta = getCategoryMeta(cat);
                  const Icon = meta.icon;
                  return (
                    <SelectItem key={cat} value={cat} className="h-11 rounded-lg focus:bg-white/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-md", meta.color.split(" ")[0])}>
                          <Icon className={cn("size-4", meta.color.split(" ")[1])} />
                        </div>
                        <span className="font-medium text-sm">{meta.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Date Picker */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-14 pl-11 rounded-xl bg-white/[0.02] border-white/5 focus:border-cobalt-500/30"
              />
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Notes</Label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 size-4 text-muted-foreground/30" />
              <Textarea
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] pl-11 pt-4 rounded-xl bg-white/[0.02] border-white/5 focus:border-cobalt-500/30 resize-none font-medium text-sm placeholder:text-muted-foreground/20"
              />
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            form="tx-form"
            size="lg"
            className={cn(
              "flex-1 h-14 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg",
              txType === "income" 
                ? "bg-jade-500 hover:bg-jade-600 shadow-jade-500/10" 
                : "bg-ember-500 hover:bg-ember-600 shadow-ember-500/10"
            )}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Transaction"}
          </Button>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-14 px-6 rounded-xl hover:bg-white/5 text-muted-foreground"
            >
              Cancel
            </Button>
          </SheetClose>
        </motion.div>
        
        <p className="text-[10px] text-center text-muted-foreground/30 font-medium">
          Press <kbd className="font-sans px-1.5 py-0.5 rounded bg-white/5 border border-white/5">⌘</kbd> + <kbd className="font-sans px-1.5 py-0.5 rounded bg-white/5 border border-white/5">Enter</kbd> to save
        </p>
      </motion.div>
    </form>
  );
}

// ─── TxTypeToggle ─────────────────────────────────────────────────────────────

function TxTypeToggle({
  value,
  onChange,
}: {
  value: "income" | "expense";
  onChange: (v: "income" | "expense") => void;
}) {
  return (
    <div className="relative flex p-1.5 bg-white/[0.02] rounded-[24px] border border-white/5 backdrop-blur-md">
      <motion.div
        layoutId="toggle-bg"
        className={cn(
          "absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-[18px] shadow-2xl transition-colors duration-500",
          value === "income" 
            ? "bg-jade-500/90 shadow-jade-500/30" 
            : "bg-ember-500/90 shadow-ember-500/30",
        )}
        animate={{
          x: value === "income" ? "0%" : "100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => onChange("income")}
        className={cn(
          "relative w-1/2 flex items-center justify-center gap-2.5 py-4 text-xs z-10 rounded-2xl transition-all duration-300 cursor-pointer font-black uppercase tracking-[0.2em]",
          value === "income"
            ? "text-white"
            : "text-muted-foreground/60 hover:text-foreground",
        )}
      >
        <ArrowUpCircle className={cn("h-4 w-4 transition-transform duration-500", value === "income" ? "scale-125 rotate-0" : "scale-100 -rotate-45")} />
        Income
      </button>
      <button
        type="button"
        onClick={() => onChange("expense")}
        className={cn(
          "relative w-1/2 flex items-center justify-center gap-2.5 py-4 text-xs z-10 rounded-2xl transition-all duration-300 cursor-pointer font-black uppercase tracking-[0.2em]",
          value === "expense"
            ? "text-white"
            : "text-muted-foreground/60 hover:text-foreground",
        )}
      >
        <ArrowDownCircle className={cn("h-4 w-4 transition-transform duration-500", value === "expense" ? "scale-125 rotate-0" : "scale-100 45")} />
        Expense
      </button>
    </div>
  );
}
