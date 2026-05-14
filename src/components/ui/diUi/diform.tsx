"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryMeta,
} from "@/lib/txop";
import { motion, Variants } from "framer-motion";
import { TxTypeToggle } from "./ditoggler.tsx"
// ─── Types ────────────────────────────────────────────────────────────────────


interface DiFormProps {
  onSuccess: () => Promise<void>;
  txType: "income" | "expense";
  setTxType: (type: "income" | "expense") => void;
}



export function DiForm({ onSuccess, txType, setTxType }: DiFormProps) {
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

  const handleSubmit = async (e?: React.SubmitEvent) => {
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
          <Label className="text-md font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">Amount</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className={cn(
                "text-lg font-bold transition-colors duration-300",
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
  className={cn(
    "h-20 w-full pl-12 pr-16 border rounded-2xl text-4xl font-bold tracking-tight outline-none transition-all tabular-nums placeholder:text-white/5",
    
    txType === "income"
      ? "bg-jade-500/5 border-jade-500/10 focus:border-jade-500/30 focus:bg-jade-500/10"
      : "bg-ember-500/5 border-ember-500/10 focus:border-ember-500/30 focus:bg-ember-500/10"
  )}
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
              <SelectTrigger className="p-5 w-full rounded-md bg-white/2 border-white/5 px-4 hover:bg-white/5 transition-all">
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
              <SelectContent
                side="bottom"
                align="start"
                sideOffset={8}
                avoidCollisions={false}
                position="popper"
                className="rounded-md  border-white/10 bg-background/95 backdrop-blur-3xl  w-(--radix-select-trigger-width)"
              >
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
                className="h-14 pl-11 rounded-xl bg-white/2 border-white/5 focus:border-cobalt-500/30"
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
                className="min-h-25 pl-11 pt-4 rounded-xl bg-white/2 border-white/5 focus:border-cobalt-500/30 resize-none font-medium text-sm placeholder:text-muted-foreground/20"
              />
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            form="tx-form"
            size="sm"
            className={cn(
              "flex-1 p-8 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-lg",
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
              variant="secondary"
              className="p-8 rounded-md hover:bg-white/5 text-muted-foreground"
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
