"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { Transaction, getAllTransactions } from "@/lib/txop";
import { formatCurrency } from "@/lib/currency";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { ChartBarDefault } from "../dashboard/widgets/chart";
import { ChartPieInteractive } from "./widgets/piechart";
import { DataTable } from "./widgets/table";
import { getTableColumns } from "./widgets/tablecolumes";
import DashHeader from "./widgets/dashheader";
import DashSummary, { SummaryItem } from "./widgets/sumdata";


// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Derived — always in sync with transactions state
  const { income, expense, balance } = transactions.reduce(
    (acc, tx) => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.tx_type === "income") acc.income += amt;
      else acc.expense += amt;
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 },
  );

  const fetchTransactions = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const txs = await getAllTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this transaction?")) return;

      // Optimistic update — instant UI response
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));

      try {
        await invoke("delete_tx", { id });
        toast.success("Transaction deleted", {
          description: "The record has been permanently removed.",
        });
      } catch (err: any) {
        // Rollback on failure
        fetchTransactions();
        toast.error("Delete failed", {
          description: err.message || "Could not delete the transaction.",
        });
      }
    },
    [fetchTransactions],
  );

  const columns = getTableColumns(handleDelete);

  const summaryData: SummaryItem[] = [
    {
      id: "income",
      title: "Total Income",
      sum: formatCurrency(income.toFixed(2)),
      icon: TrendingUp,
      color: "green",
    },
    {
      id: "expense",
      title: "Total Expenses",
      sum: formatCurrency(expense.toFixed(2)),
      icon: TrendingDown,
      color: "red",
    },
    {
      id: "balance",
      title: "Net Savings",
      sum: formatCurrency(balance.toFixed(2)),
      icon: Wallet,
      color: balance >= 0 ? "rust" : "red",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 text-rust-500 animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your finances...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-[#4ade80]/30 p-6 space-y-6">
      <DashHeader
        name="Abdo"
        balance={formatCurrency(balance.toFixed(2))}
        onRefresh={() => fetchTransactions(true)}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryData.map((item) => (
          <DashSummary key={item.id} {...item} />
        ))}
      </div>

      <div className="flex lg:flex-row flex-col gap-4">
        <div className="w-full">
          <ChartBarDefault />
        </div>
        <div className="w-full">
          <ChartPieInteractive />
        </div>
      </div>

      <div>
        <DataTable columns={columns} data={transactions} />
      </div>
    </div>
  );
}


