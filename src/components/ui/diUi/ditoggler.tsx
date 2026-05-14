"use client";
import {
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion  } from "framer-motion";



export function TxTypeToggle({
  value,
  onChange,
}: {
  value: "income" | "expense";
  onChange: (v: "income" | "expense") => void;
}) {
  return (
    <div className="relative flex p-1.5 bg-white/2 rounded-md border border-white/5 backdrop-blur-md">
      <motion.div
        layoutId="toggle-bg"
        className={cn(
          "absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-md shadow-2xl transition-colors duration-500",
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
          "relative w-1/2 flex items-center justify-center gap-2.5 py-4 text-xs z-10 rounded-md transition-all duration-300 cursor-pointer font-black uppercase tracking-[0.2em]",
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
          "relative w-1/2 flex items-center justify-center gap-2.5 py-4 text-xs z-10 rounded-md transition-all duration-300 cursor-pointer font-black uppercase tracking-[0.2em]",
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
