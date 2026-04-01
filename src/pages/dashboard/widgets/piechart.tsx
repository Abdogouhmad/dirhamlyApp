"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { type PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryMeta,
  type Category,
} from "@/lib/txop";
import { getAllTransactions, type Transaction } from "../service/dashservice";
import { useRefresh } from "@/lib/Refreshcontext";

// ─── Color map ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<Category, string> = {
  food: "#f59e0b",
  health: "#f43f5e",
  entertainment: "#a855f7",
  utilities: "#0ea5e9",
  shopping: "#ec4899",
  e_shopping: "#8b5cf6",
  transport: "#f97316",
  rent: "#ef4444",
  withdrawal: "#6366f1",
  salary: "#22c55e",
  freelance: "#14b8a6",
  investment: "#06b6d4",
  bank_interest: "#3b82f6",
  gift: "#d946ef",
  other: "#71717a",
};

// ─── Chart config ─────────────────────────────────────────────────────────────
const chartConfig: ChartConfig = {
  amount: { label: "Amount (MAD)" },
  ...Object.fromEntries(
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((cat) => [
      cat,
      {
        label: getCategoryMeta(cat).label,
        color: CATEGORY_COLORS[cat as Category],
      },
    ]),
  ),
};

type TxType = "expense" | "income";

interface CategorySlice {
  category: Category;
  amount: number;
  fill: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ChartPieInteractive() {
  const id = "pie-interactive";

  const [txType, setTxType] = React.useState<TxType>("expense");
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<Category | null>(null);

  const { register } = useRefresh();

  // Fetch transactions from backend
  const fetchData = React.useCallback(async () => {
    try {
      const txs = await getAllTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Pie chart fetch error:", err);
    }
  }, []);

  // Initial fetch on mount
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Register into RefreshContext — called whenever add/delete fires refresh()
  React.useEffect(() => {
    register(fetchData);
  }, [register, fetchData]);

  // Aggregate amounts per category for selected tx type
  const chartData = React.useMemo<CategorySlice[]>(() => {
    const categories =
      txType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const totals: Partial<Record<Category, number>> = {};
    for (const tx of transactions) {
      if (tx.tx_type !== txType) continue;
      const cat = tx.category as Category;
      totals[cat] = (totals[cat] ?? 0) + (parseFloat(tx.amount) || 0);
    }

    return categories
      .filter((cat) => (totals[cat] ?? 0) > 0)
      .map((cat) => ({
        category: cat,
        amount: Math.round((totals[cat] ?? 0) * 100) / 100,
        fill: CATEGORY_COLORS[cat],
      }));
  }, [transactions, txType]);

  // Auto-select first slice when data changes
  React.useEffect(() => {
    setActiveCategory(chartData.length > 0 ? chartData[0].category : null);
  }, [chartData]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((d) => d.category === activeCategory),
    [chartData, activeCategory],
  );

  const activeSlice = activeIndex >= 0 ? chartData[activeIndex] : null;

  const totalAmount = React.useMemo(
    () => chartData.reduce((sum, d) => sum + d.amount, 0),
    [chartData],
  );

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            {txType === "expense" ? "Expense" : "Income"} breakdown
          </CardDescription>
        </div>

        <Select value={txType} onValueChange={(v) => setTxType(v as TxType)}>
          <SelectTrigger
            className="ml-auto h-7 w-[120px] rounded-lg pl-2.5"
            aria-label="Select transaction type"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            <SelectItem value="expense" className="rounded-lg">Expenses</SelectItem>
            <SelectItem value="income" className="rounded-lg">Income</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            No {txType} data yet
          </div>
        ) : (
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) =>
                      `${Number(value).toLocaleString()} MAD`
                    }
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
                onClick={(_, index) =>
                  setActiveCategory(chartData[index].category)
                }
                style={{ cursor: "pointer" }}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {activeSlice
                              ? activeSlice.amount.toLocaleString()
                              : totalAmount.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 22}
                            className="fill-muted-foreground text-xs"
                          >
                            {activeSlice
                              ? getCategoryMeta(activeSlice.category).label
                              : "MAD total"}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      {/* Legend */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-4 pb-4 pt-2">
          {chartData.map((slice) => (
            <button
              key={slice.category}
              onClick={() => setActiveCategory(slice.category)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: slice.fill }}
              />
              {getCategoryMeta(slice.category).label}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
