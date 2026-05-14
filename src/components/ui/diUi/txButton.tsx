"use client";

import { useState  } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { DiForm } from "./diform";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TxButtonProps {
  onSuccess?: () => Promise<void>;
}

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
              ? "m-0 rounded-md justify-center"
              : "w-full justify-start p-4 rounded-md shadow-xl shadow-cobalt-500/20",
          )}
        >
          <div className="absolute inset-0 bg-linear-to-r from-cobalt-400 to-cobalt-600 opacity-100 group-hover:scale-105 transition-transform duration-500" />
          <Plus className={cn("size-5 shrink-0 relative z-10 transition-transform duration-300 group-hover:rotate-90", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="relative z-10 font-bold tracking-tight">Add Transaction</span>}
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

