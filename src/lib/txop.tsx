// ─── Categories ───────────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  "food",
  "health",
  "entertainment",
  "utilities",
  "shopping",
  "e_shopping",
  "transport",
  "withdrawal",
  "rent",
  "other",
] as const;

export const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "bank_interest",
  "gift",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type Category = ExpenseCategory | IncomeCategory;

export const CATEGORY_META: Record<Category, { label: string; color: string }> =
  {
    // Expense
    food: {
      label: "Food",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/40",
    },
    health: {
      label: "Health",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/40",
    },
    entertainment: {
      label: "Entertainment",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/40",
    },
    utilities: {
      label: "Utilities",
      color: "bg-sky-500/10 text-sky-500 border-sky-500/40",
    },
    shopping: {
      label: "Shopping",
      color: "bg-pink-500/10 text-pink-500 border-pink-500/40",
    },
    e_shopping: {
      label: "E-Shopping",
      color: "bg-violet-500/10 text-violet-500 border-violet-500/40",
    },
    transport: {
      label: "Transport",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/40",
    },
    rent: {
      label: "Rent",
      color: "bg-red-500/10 text-red-500 border-red-500/40",
    },
    // Income
    salary: {
      label: "Salary",
      color: "bg-jade-500/10 text-jade-500 border-jade-500/40",
    },
    freelance: {
      label: "Freelance",
      color: "bg-teal-500/10 text-teal-500 border-teal-500/40",
    },
    investment: {
      label: "Investment",
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/40",
    },
    bank_interest: {
      label: "Bank Interest",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/40",
    },
    withdrawal: {
      label: "Withdrawal",
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/40",
    },
    gift: {
      label: "Gift",
      color: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/40",
    },
    other: {
      label: "Other",
      color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/40",
    },
  };

export function getCategoryMeta(cat: string) {
  return (
    CATEGORY_META[cat as Category] ?? {
      label: cat,
      color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/40",
    }
  );
}
