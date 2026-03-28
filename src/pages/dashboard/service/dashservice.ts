import { invoke } from "@tauri-apps/api/core";

// ─── Transaction type ─────────────────────────────────────────────────────────
// Must match your Rust struct field names exactly

export type Transaction = {
  id: number | null;
  date: string;           // ISO date string e.g. "2026-03-18"
  tx_type: "income" | "expense";
  category: string;
  description: string | null;
  amount: string;         // stored as string from SQLite REAL
};


export type MonthlyBalance = {
  month: string;     // "2026-03"
  income: string;    // keep as string like your other amounts
  expense: string;
};

export type MonthlyData = {
  month: string;        // e.g. "2026-03" or "Mar"
  income: number;
  expense: number;
  balance: number;
};


// ─── Fetch all transactions from Tauri backend ────────────────────────────────
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    return await invoke<Transaction[]>("get_all");
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return [];
  }
}

// Optional: fetch by month
export async function getTransactionsByMonth(yearMonth: string): Promise<Transaction[]> {
  try {
    return await invoke<Transaction[]>("get_by_month", { yearMonth });
  } catch (err) {
    console.error("Failed to fetch transactions by month:", err);
    return [];
  }
}

export async function getBalanceTransaction(): Promise<number> {
  try {
    const result = await invoke<number>("get_balance");
    return result ?? 0;
  } catch (err) {
    console.error("get balance:", err);
    throw err;
  }
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0.00";

  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}


export async function getMonthlyBalance(year?: number): Promise<MonthlyBalance[]> {
  try {
    const currentYear = year || new Date().getFullYear();
    return await invoke<MonthlyBalance[]>("get_monthly_balance", { year: currentYear });
  } catch (err) {
    console.error("Failed to fetch monthly balance:", err);
    return [];
  }
}