// ./widgets/tabledata.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getCategoryMeta } from "@/lib/txop";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Transaction } from "../service/dashservice";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { formatAmount } from "@/lib/currency";

import { Trash2 } from "lucide-react";

export type TransactionRow = Transaction;

export function getTableColumns(
  onDelete: (id: number) => void,
  currencyCode = "MAD"
): ColumnDef<Transaction>[] {
  const getLocale = () => {
    const userLocale = navigator.language || "en-US";

    if (userLocale.startsWith("fr")) {
      return fr; // Good support for fr-MA, fr-FR, etc.
    }
    return enUS;
  };

  const locale = getLocale();
  return [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const dateValue = row.getValue("date") as string;
        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
          return <div className="text-muted-foreground italic">Invalid date</div>;
        }

        const formattedDate = format(date, "MMM dd, yyyy", { locale });

        return <div className="font-semibold text-foreground/90">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "tx_type",
      header: () => (
        <div className="text-left">
          Type
        </div>
      ),
      enableSorting: true,
      filterFn: "equals",
      cell: ({ row }) => {
        const type = row.getValue("tx_type") as "income" | "expense";
        return (
          <div className="flex justify-start">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-0.5 border-none font-bold text-[10px] uppercase tracking-wider -ml-3",
                type === "income"
                  ? "text-jade-400 bg-jade-500/10"
                  : "text-ember-400 bg-ember-500/10"
              )}
            >
              {type === "income" ? "Income" : "Expense"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => (
        <div className="text-left">
          Category
        </div>
      ),
      enableSorting: true,
      cell: ({ row }) => {
        const cat = row.getValue("category") as string;
        const meta = getCategoryMeta(cat);
        return (
          <div className="flex justify-start">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-0.5 border-white/5 bg-white/5 capitalize font-semibold text-[10px] text-foreground/80 uppercase tracking-wider  -ml-3",
                meta.color.replace("border-", "text-").replace("/40", "")
              )}
            >
              <span className={cn("rounded-full shrink-0", meta.color.replace("border-", "bg-"))} />
              {meta.label}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string | null;
        return desc?.trim() ? (
          <div className="text-muted-foreground/80 font-medium line-clamp-1 italic max-w-[200px]">{desc}</div>
        ) : (
          <span className="text-muted-foreground/30">—</span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => (
        <div className="text-right">
          Amount
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount") as string) || 0;
        const type = row.original.tx_type;
        const formatted = formatAmount(amount, currencyCode);
        
        return (
          <div
            className={cn(
              "text-right font-bold text-base",
              type === "income" ? "text-jade-500" : "text-ember-500",
            )}
          >
            {type === "income" ? "+" : "-"}
            {formatted.replace(currencyCode, "").trim()}
            <span className="text-[10px] ml-1 opacity-60">{currencyCode}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center">
          Actions
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.id;
        if (!id) return null;
        return (
          <div className="flex justify-center">
            <button
              onClick={() => onDelete(id)}
              className="text-muted-foreground hover:text-ember-500 transition-all duration-200 p-2 rounded-xl hover:bg-ember-500/10 group active:scale-90"
              title="Delete transaction"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];
}
