"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const chartConfig = {
  income: {
    label: "Income",
    theme: {
      light: "var(--jade-500)",
      dark: "var(--jade-500)",
    },
  },
  expense: {
    label: "Expense",
    theme: {
      light: "var(--ember-500)",
      dark: "var(--ember-500)",
    },
  },
} satisfies ChartConfig;

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
}

export function ChartBarDefault({ data = [] }: { data?: MonthlyData[] }) {
  const currentYear = new Date().getFullYear();

  const chartData = data.map((item) => {
    const monthNum = parseInt(item.month.split("-")[1]) - 1;
    return {
      month: monthNames[monthNum] ?? item.month.slice(5),
      income: item.income,
      expense: item.expense,
    };
  });

  const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card className="flex flex-col h-full border-none bg-white/[0.01] backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Financial Overview</CardTitle>
            <CardDescription className="text-muted-foreground/60">
              Income vs Expenses for {currentYear}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-jade-500" />
              Income
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ember-500" />
              Expense
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-6 pt-2">
        {!hasData ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground/40 text-sm italic">
            No transaction history for this period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart accessibilityLayer data={chartData} barSize={20} barGap={8}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={12}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={formatYAxis}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--white)', opacity: 0.05 }}
                content={<ChartTooltipContent
                  className="backdrop-blur-2xl border-white/10 bg-background/90"
                  indicator="dot"
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="capitalize text-muted-foreground/80 font-medium">{name}</span>
                      <span className="font-bold text-foreground">{Number(value).toLocaleString("fr-MA")} MAD</span>
                    </div>
                  )}
                />}
              />
              <Bar dataKey="income" fill="var(--jade-500)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="var(--ember-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}