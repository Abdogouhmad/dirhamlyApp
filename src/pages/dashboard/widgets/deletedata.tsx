// import { Trash2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
// import { getAllTransactions } from "@/lib/txop";

// Inside your component function:

const handleDelete = async (id: number | null) => {
  if (!id) return;

  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  try {
    await invoke("delete_tx", { id });
    toast("Deleted", {
      description: "Transaction removed successfully",
    });

    // Refresh data
    // const updated = await getAllTransactions();
    // setTransactions(updated);

    // // Or recalculate summary if you have income/expense/balance state
    // recalculateTotals(updated);
  } catch (err: any) {
    toast("Error", {
      description: err.message || "Failed to delete transaction",
    });
  }
};

export default handleDelete;
