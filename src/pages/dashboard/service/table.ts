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

// ─── Fetch all transactions from Tauri backend ────────────────────────────────

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const result = await invoke<Transaction[]>("get_all_transactions");
    return result ?? [];
  } catch (err) {
    console.error("getAllTransactions error:", err);
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
 
 
