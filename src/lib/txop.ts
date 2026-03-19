import { invoke } from "@tauri-apps/api/core";

export interface Transaction {
  id: number | null;
  tx_type: "income" | "expense";
  amount: string;
  category: string;
  description: string | null;
  date: string;
}


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

export interface AddTxResponse {
  id: number;
}

// Optional: type-safe invoke helpers
export async function addTransaction(data: Transaction): Promise<AddTxResponse> {
  try {
    const id = await invoke<number>('add_tx', {
      txType: data.tx_type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
    });
    return { id };
  } catch (err) {
    console.error('Failed to add transaction:', err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

