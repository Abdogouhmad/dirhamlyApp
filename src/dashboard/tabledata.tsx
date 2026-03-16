"use client";

import { ColumnDef } from "@tanstack/react-table";

export type OpsTypes = {
  id: string;
  tx_type: "income" | "expense";
  category: string;
  details: string;
  amount: number;
  date: string;
};

export const TableData: OpsTypes[] = [
  {
    id: "1",
    tx_type: "income",
    category: "salary",
    details: "Foundever salary",
    amount: 5500,
    date: "2026-03-01",
  },
  {
    id: "2",
    tx_type: "expense",
    category: "food",
    details: "Lunch with friends",
    amount: 120,
    date: "2026-03-02",
  },
  {
    id: "3",
    tx_type: "expense",
    category: "transport",
    details: "Taxi ride",
    amount: 45,
    date: "2026-03-03",
  },
  {
    id: "4",
    tx_type: "expense",
    category: "shopping",
    details: "New headphones",
    amount: 800,
    date: "2026-03-05",
  },
  {
    id: "5",
    tx_type: "income",
    category: "freelance",
    details: "Website project payment",
    amount: 2300,
    date: "2026-03-07",
  },
  {
    id: "6",
    tx_type: "expense",
    category: "subscription",
    details: "Netflix monthly",
    amount: 95,
    date: "2026-03-08",
  },
  {
    id: "7",
    tx_type: "expense",
    category: "groceries",
    details: "Carrefour groceries",
    amount: 340,
    date: "2026-03-10",
  },
  {
    id: "8",
    tx_type: "income",
    category: "bonus",
    details: "Performance bonus",
    amount: 1200,
    date: "2026-03-12",
  },
];

export const TableColumes: ColumnDef<OpsTypes>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));

      const formatted = new Intl.DateTimeFormat("fr-MA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  { accessorKey: "tx_type", header: "Type", enableSorting: true },
  { accessorKey: "category", header: "Category", enableSorting: true },
  {
    accessorKey: "details",
    header: "Details",
  },
  {
    accessorKey: "amount",
    header: () => (
      <div className="text-left text-sm font-semibold tracking-wide">
        Amount
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.original.amount;
      const type = row.original.tx_type;

      const formatted = new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        minimumFractionDigits: 2,
      }).format(amount);

      const color = type === "income" ? "text-green-500" : "text-red-500";

      return (
        <div className={`text-left font-medium ${color}`}>{formatted}</div>
      );
    },
  },
];
