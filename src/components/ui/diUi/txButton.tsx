import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
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
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Plus,
  Tag,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Textarea } from "../textarea";

/* ---------------------- MAIN BUTTON ---------------------- */

export function TxButton() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const [txType, setTxType] = useState<"income" | "expense">("expense");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className={cn(
            "transition-all duration-200 border-2 bg-foreground text-white dark:text-black hover:bg-rust-500 hover:border-rust-500/80",
            isCollapsed
              ? "h-10 w-10 px-0 justify-center"
              : "w-full justify-start px-4"
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

        {/* FORM */}
        <div className="flex-1 overflow-y-auto m-3">
          <DiForm txType={txType} setTxType={setTxType} />
        </div>

        {/* FOOTER */}
        <SheetFooter className="flex gap-4">
          <Button
            type="submit"
            size="lg"
            className="w-full hover:bg-rust-500"
          >
            Save
          </Button>

          <SheetClose asChild>
            <Button
              size="lg"
              variant="secondary"
              className="w-full hover:bg-red-500 hover:text-white"
            >
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------------- FORM ---------------------- */

function DiForm({
  txType,
  setTxType,
}: {
  txType: "income" | "expense";
  setTxType: (type: "income" | "expense") => void;
}) {
  return (
    <form className="grid gap-6">
      <TxTypeToggle value={txType} onChange={setTxType} />

      <FormField label="Amount" htmlFor="tx-amount">
        <InputGroup>
          <InputGroupAddon>
            <Banknote className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput id="tx-amount" type="number" placeholder="0.00" />
          <InputGroupAddon className="text-xs font-semibold">
            MAD
          </InputGroupAddon>
        </InputGroup>
      </FormField>

      <FormField label="Category" htmlFor="category">
        <InputGroup>
          <InputGroupAddon>
            <Tag className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput id="category" placeholder="e.g Food" />
        </InputGroup>
      </FormField>

      <FormField label="Description" htmlFor="description">
        <Textarea id="description" placeholder="Optional note..." />
      </FormField>
    </form>
  );
}

/* ---------------------- REUSABLE FIELD ---------------------- */

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

/* ---------------------- TX TYPE TOGGLE ---------------------- */

function TxTypeToggle({
  value,
  onChange,
}: {
  value: "income" | "expense";
  onChange: (v: "income" | "expense") => void;
}) {
  return (
    <div className="relative flex p-1 bg-muted rounded-lg border border-border/50">
      {/* Sliding background */}
      <div
        className={cn(
          "absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-background rounded-md shadow-sm transition-transform duration-300",
          value === "expense" ? "translate-x-full" : "translate-x-0"
        )}
      />

      <ToggleBtn
        active={value === "income"}
        onClick={() => onChange("income")}
        icon={<ArrowUpCircle className="text-green-500" />}
        label="Income"
      />

      <ToggleBtn
        active={value === "expense"}
        onClick={() => onChange("expense")}
        icon={<ArrowDownCircle className="text-red-500" />}
        label="Expense"
      />
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "relative w-1/2 flex items-center justify-center gap-2 py-2 text-sm z-10 hover:bg-transparent",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      {label}
    </Button>
  );
}
