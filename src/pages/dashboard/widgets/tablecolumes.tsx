// ./widgets/tabledata.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getCategoryMeta } from "@/lib/txop";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Transaction } from "../service/dashservice";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export type TransactionRow = Transaction;

export function getTableColumns(
  onDelete: (id: number) => void,
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
          return <div className="text-muted-foreground">Invalid date</div>;
        }

        const formattedDate = format(date, "PPP", { locale });

        return <div className="font-medium">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "tx_type",
      header: "Type",
      enableSorting: true,
      filterFn: "equals",
      cell: ({ row }) => {
        const type = row.getValue("tx_type") as "income" | "expense";
        return (
          <Badge
            variant="outline"
            className={
              type === "income"
                ? "border-jade-500/40 text-jade-500 bg-jade-500/10"
                : "border-ember-500/40 text-ember-500 bg-ember-500/10"
            }
          >
            {type === "income" ? "Income" : "Expense"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
      cell: ({ row }) => {
        const cat = row.getValue("category") as string;
        const meta = getCategoryMeta(cat);
        return (
          <Badge
            variant="outline"
            className={cn("capitalize font-medium", meta.color)}
          >
            {meta.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string | null;
        return desc?.trim() ? (
          <div className="text-muted-foreground line-clamp-1">{desc}</div>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => (
        <div className="text-left text-sm font-semibold tracking-wide">
          Amount
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount") as string) || 0;
        const type = row.original.tx_type;
        const formatted = new Intl.NumberFormat("fr-MA", {
          style: "currency",
          currency: "MAD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
        return (
          <div
            className={cn(
              "text-left font-semibold",
              type === "income" ? "text-jade-500" : "text-ember-500",
            )}
          >
            {type === "income" ? "+" : "-"}
            {formatted}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center text-sm font-semibold tracking-wide">
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
              className="text-ember-400 font-semibold hover:text-ember-600 transition-all duration-200 p-1.5 rounded-md hover:bg-ember-500/10 group"
              title="Delete transaction"
            >
              DELETE
            </button>
          </div>
        );
      },
    },
  ];
}
