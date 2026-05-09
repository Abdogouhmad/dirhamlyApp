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
import { cn } from "@/lib/utils";
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
  const [activeCategory, setActiveCategory] = React.useState<Category | null>(
    null,
  );

  const { register } = useRefresh();

  const fetchData = React.useCallback(async () => {
    try {
      const txs = await getAllTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Pie chart fetch error:", err);
    }
  }, []);

  // Initial fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Register into context and clean up on unmount
  React.useEffect(() => {
    const unregister = register(fetchData);
    return unregister;
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
    <Card data-chart={id} className="flex flex-col h-full border-none bg-white/[0.01] backdrop-blur-sm">
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="flex-row items-start space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-xl font-bold tracking-tight">Spending Analysis</CardTitle>
          <CardDescription className="text-muted-foreground/60">
            {txType === "expense" ? "Expenses" : "Income"} by category
          </CardDescription>
        </div>

        <Select value={txType} onValueChange={(v) => setTxType(v as TxType)}>
          <SelectTrigger
            className="ml-auto h-9 w-32 rounded-xl bg-white/[0.05] border-white/5 backdrop-blur-md pl-3 font-semibold text-xs uppercase tracking-wider"
            aria-label="Select type"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-2xl backdrop-blur-2xl">
            <SelectItem value="expense" className="rounded-xl font-medium">
              Expenses
            </SelectItem>
            <SelectItem value="income" className="rounded-xl font-medium">
              Income
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0 pt-4">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-sm text-muted-foreground/40 italic">
            No data recorded for this type.
          </div>
        ) : (
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-72"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="backdrop-blur-2xl border-white/10 bg-background/90"
                    formatter={(value) => (
                      <span className="font-bold text-foreground">
                        {Number(value).toLocaleString()} <span className="text-[10px] opacity-60">MAD</span>
                      </span>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={65}
                strokeWidth={8}
                stroke="transparent"
                activeIndex={activeIndex}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 8} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 18}
                      innerRadius={outerRadius + 10}
                      opacity={0.3}
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
                            className="fill-foreground text-3xl font-black tracking-tight"
                          >
                            {activeSlice
                              ? activeSlice.amount.toLocaleString()
                              : totalAmount.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest"
                          >
                            {activeSlice
                              ? getCategoryMeta(activeSlice.category).label
                              : "MAD Total"}
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
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2.5 px-6 pb-8 pt-4">
          {chartData.map((slice) => (
            <button
              key={slice.category}
              onClick={() => setActiveCategory(slice.category)}
              className={cn(
                "flex items-center gap-2 text-[11px] font-semibold transition-all duration-200",
                activeCategory === slice.category 
                  ? "text-foreground scale-110" 
                  : "text-muted-foreground/60 hover:text-muted-foreground hover:scale-105"
              )}
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full shrink-0 shadow-sm",
                  activeCategory === slice.category && "ring-4 ring-white/5"
                )}
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
