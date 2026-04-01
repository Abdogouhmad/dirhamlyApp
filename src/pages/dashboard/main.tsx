"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";
import {
  Transaction,
  getAllTransactions,
  formatCurrency,
  getMonthlyBalance,
  MonthlyData,
} from "./service/dashservice.ts";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { ChartBarDefault } from "../dashboard/widgets/chart";
import { ChartPieInteractive } from "./widgets/piechart";
import { DataTable } from "./widgets/table";
import { getTableColumns } from "./widgets/tablecolumes";
import DashHeader from "./widgets/dashheader";
import DashSummary, { SummaryItem } from "./widgets/sumdata";
import { useRefresh } from "@/lib/Refreshcontext.tsx";

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { register } = useRefresh(); // ← grab register

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

  const fetchTransactions = useCallback(async () => {
    try {
      const txs = await getAllTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlyData = useCallback(async () => {
    try {
      const raw = await getMonthlyBalance();
      const formatted = raw.map((item) => ({
        month: item.month,
        income: parseFloat(item.income) || 0,
        expense: parseFloat(item.expense) || 0,
        balance: parseFloat(item.income) - parseFloat(item.expense),
      }));
      setMonthlyData(formatted);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchTransactions(), fetchMonthlyData()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchTransactions, fetchMonthlyData]);

  // Register the refresh callback so TxButton (in sidebar) can trigger it
  useEffect(() => {
    register(handleRefresh);
  }, [register, handleRefresh]);

  useEffect(() => {
    fetchTransactions();
    fetchMonthlyData();
  }, [fetchTransactions, fetchMonthlyData]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this transaction?")) return;

      // Optimistic remove — no reload flicker
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));

      try {
        await invoke("delete_tx", { id });
        toast.success("Transaction deleted", {
          description: "The record has been permanently removed.",
        });
        // Sync chart data only (transactions already updated optimistically)
        await fetchMonthlyData();
      } catch (err: any) {
        // Restore state on failure
        await Promise.all([fetchTransactions(), fetchMonthlyData()]);
        toast.error("Delete failed", {
          description: err.message || "Could not delete the transaction.",
        });
      }
    },
    [fetchTransactions, fetchMonthlyData],
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
      title: "Your Current Balance",
      sum: formatCurrency(balance.toFixed(2)),
      icon: Wallet,
      color: balance >= 0 ? "rust" : "red",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 text-cobalt-300 animate-spin" />
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
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryData.map((item) => (
          <DashSummary key={item.id} {...item} />
        ))}
      </div>

      <div className="flex lg:flex-row flex-col gap-4">
        <div className="w-full">
          <ChartBarDefault data={monthlyData} />
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
