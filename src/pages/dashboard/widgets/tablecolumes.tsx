// ./widgets/tabledata.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/txop";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type TransactionRow = Transaction;

// Column definitions updated for real data
export function getTableColumns(
  onDelete: (id: number) => void,
): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const id = row.getValue("id") as number | null;
        return (
          <span className="text-muted-foreground text-xs font-mono">
            {id ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const dateStr = row.getValue("date") as string;
        const date = new Date(dateStr);
        // Handle invalid dates gracefully
        if (isNaN(date.getTime()))
          return <div className="text-muted-foreground">Invalid date</div>;
        return (
          <div className="font-medium">
            {new Intl.DateTimeFormat("fr-MA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }).format(date)}
          </div>
        );
      },
    },
    {
      accessorKey: "tx_type",
      header: "Type",
      enableSorting: true,
      filterFn: "equals", // ← ADD THIS
      cell: ({ row }) => {
        const type = row.getValue("tx_type") as "income" | "expense";
        return (
          <Badge
            variant="outline"
            className={
              type === "income"
                ? "border-jade-500/40 text-jade-500 bg-jade-500/10"
                : "border-ember-500/ text-ember-500 bg-ember-500/10"
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
      cell: ({ row }) => (
        <div className="capitalize font-medium">{row.getValue("category")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string | null;
        return desc && desc.trim() ? (
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
        const amountStr = row.getValue("amount") as string;
        const type = row.original.tx_type;

        // Safely parse the string amount
        const amount = parseFloat(amountStr) || 0;

        const formatted = new Intl.NumberFormat("fr-MA", {
          style: "currency",
          currency: "MAD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);

        return (
          <div
            className={`text-left font-semibold ${
              type === "income" ? "text-jade-500" : "text-ember-500"
            }`}
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
              className="text-ember-400 hover:text-ember-600 transition-all duration-200 p-1.5 rounded-md hover:bg-ember-500/10 group"
              title="Delete transaction"
            >
              <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        );
      },
    },
  ];
}
