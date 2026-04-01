"use client";

import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { ArrowDownCircle, ArrowUpCircle, Banknote, Plus } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryMeta,
} from "@/lib/txop";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TxButtonProps {
  onSuccess?: () => Promise<void>;
}

interface DiFormProps {
  onSuccess: () => Promise<void>;
}

// ─── TxButton ─────────────────────────────────────────────────────────────────

export function TxButton({ onSuccess }: TxButtonProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [open, setOpen] = useState(false);

  // Close the sheet and trigger parent data refresh
  const handleSuccess = async () => {
    setOpen(false);
    await onSuccess?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className={cn(
            "transition-all duration-200 border-2 bg-cobalt-300 text-white dark:text-black hover:bg-cobalt-400 hover:border-cobalt-300/80",
            isCollapsed
              ? "h-10 w-10 px-0 justify-center"
              : "w-full justify-start px-4",
          )}
        >
          <Plus className={cn("size-5 shrink-0", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Add transaction"}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Transaction</SheetTitle>
          <SheetDescription>
            Fill out the details below to add a new transaction.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto m-3">
          {open && <DiForm onSuccess={handleSuccess} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── DiForm ───────────────────────────────────────────────────────────────────

function DiForm({ onSuccess }: DiFormProps) {
  const txTypeRef = useRef<"income" | "expense">("expense");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);

  const categories =
    txType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTxTypeChange = (type: "income" | "expense") => {
    txTypeRef.current = type;
    setTxType(type);
    setCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentTxType = txTypeRef.current;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a positive number",
      });
      return;
    }
    if (!category) {
      toast.error("Category is needed", {
        description: "Please select a category",
      });
      return;
    }
    if (!date) {
      toast.error("Date is needed", { description: "Please select a date" });
      return;
    }

    setLoading(true);
    try {
      const id = await invoke<number>("add_tx", {
        txType: currentTxType,
        amount,
        category,
        description: description.trim() || null,
        date,
      });

      toast.success("Transaction added", {
        description: `ID: ${id} • ${currentTxType} • ${amount} MAD`,
      });

      // Close sheet and refresh parent data (fetchTransactions + fetchMonthlyData)
      await onSuccess();
    } catch (err: any) {
      const msg =
        typeof err === "string"
          ? err
          : (err?.message ?? JSON.stringify(err) ?? "Unknown error");
      toast.error("Failed to save", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="tx-form" onSubmit={handleSubmit} className="grid gap-6">
      <TxTypeToggle value={txType} onChange={handleTxTypeChange} />

      {/* Amount */}
      <FormField label="Amount" htmlFor="tx-amount">
        <InputGroup>
          <InputGroupAddon>
            <Banknote className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="tx-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
          <InputGroupAddon className="text-xs font-semibold">
            MAD
          </InputGroupAddon>
        </InputGroup>
      </FormField>

      {/* Category + Date side by side */}
      <div className="flex flex-row gap-3">
        <div className="flex-1">
          <FormField label="Category" htmlFor="category">
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={loading}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const meta = getCategoryMeta(cat);
                  return (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-block h-2 w-2 rounded-full border",
                            meta.color,
                          )}
                        />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="flex-1">
          <FormField label="Date" htmlFor="tx-date">
            <Input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </FormField>
        </div>
      </div>

      {/* Description */}
      <FormField label="Description" htmlFor="description">
        <Textarea
          id="description"
          placeholder="Optional note..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </FormField>

      <SheetFooter className="flex gap-4 mt-6">
        <Button
          type="submit"
          form="tx-form"
          size="lg"
          className="w-full hover:bg-cobalt-300"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <SheetClose asChild>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full hover:bg-ember-500 hover:text-white"
            disabled={loading}
          >
            Cancel
          </Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
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
    <div className="relative flex p-1 bg-muted rounded-lg border border-border/50">
      <div
        className={cn(
          "absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-background rounded-md shadow-sm transition-transform duration-300 pointer-events-none",
          value === "expense" ? "translate-x-full" : "translate-x-0",
        )}
      />
      <button
        type="button"
        onClick={() => onChange("income")}
        className={cn(
          "relative w-1/2 flex items-center justify-center gap-2 py-2 text-sm z-10 rounded-md transition-colors duration-200 cursor-pointer",
          value === "income"
            ? "text-foreground font-medium"
            : "text-muted-foreground",
        )}
      >
        <ArrowUpCircle className="h-4 w-4 text-jade-500" />
        Income
      </button>
      <button
        type="button"
        onClick={() => onChange("expense")}
        className={cn(
          "relative w-1/2 flex items-center justify-center gap-2 py-2 text-sm z-10 rounded-md transition-colors duration-200 cursor-pointer",
          value === "expense"
            ? "text-foreground font-medium"
            : "text-muted-foreground",
        )}
      >
        <ArrowDownCircle className="h-4 w-4 text-ember-500" />
        Expense
      </button>
    </div>
  );
}
