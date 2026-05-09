"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";
import {
  Transaction,
  getAllTransactions,
  getMonthlyBalance,
  MonthlyData,
} from "./service/dashservice.ts";
import { formatAmount } from "@/lib/currency";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { ChartBarDefault } from "../dashboard/widgets/chart";
import { ChartPieInteractive } from "./widgets/piechart";
import { DataTable } from "./widgets/table";
import { getTableColumns } from "./widgets/tablecolumes";
import DashHeader from "./widgets/dashheader";
import DashSummary, { SummaryItem } from "./widgets/sumdata";
import { useRefresh } from "@/lib/Refreshcontext";
import { useProfile } from "@/lib/ProfileContext";

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { register } = useRefresh();
  const { profile } = useProfile();

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

  // Register handleRefresh and clean up on unmount
  useEffect(() => {
    const unregister = register(handleRefresh);
    return unregister;
  }, [register, handleRefresh]);

  // Initial data load
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

  const userCurrency = profile?.currency || "MAD";
  const columns = getTableColumns(handleDelete, userCurrency);

  const summaryData: SummaryItem[] = [
    {
      id: "income",
      title: "Total Income",
      sum: formatAmount(income, userCurrency),
      icon: TrendingUp,
      color: "green",
    },
    {
      id: "expense",
      title: "Total Expenses",
      sum: formatAmount(expense, userCurrency),
      icon: TrendingDown,
      color: "red",
    },
    {
      id: "savings",
      title: "Net Savings",
      sum: formatAmount(income - expense, userCurrency),
      icon: Wallet,
      color: "blue",
    },
    {
      id: "balance",
      title: "Current Balance",
      sum: formatAmount(balance, userCurrency),
      icon: Wallet,
      color: "purple",
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
        name={profile?.name}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item) => (
          <DashSummary key={item.id} {...item} currency={userCurrency} />
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
