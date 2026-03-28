"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    color: "oklch(0.700 0.130 255)",
  },
  expense: {
    label: "Expense",
    color: "oklch(0.560 0.210 22)",
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
    <Card>
      <CardHeader>
        <CardTitle>Monthly Balance</CardTitle>
        <CardDescription>Income vs Expense — {currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
            No transactions yet for this year.
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} barSize={25}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatYAxis}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                  indicator="dashed"
                  formatter={(value, name, index) => (
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5  shrink-0"
                        style={{ backgroundColor: index?.color ?? index?.fill }}
                      />
                      <span className="capitalize text-muted-foreground">{name}</span>
                      <span className="font-semibold">{Number(value).toLocaleString("fr-MA")} MAD</span>
                    </div>
                  )}
                />}
              />
              <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Income vs Spending overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Grouped bars show income and expense per month
        </div>
      </CardFooter>
    </Card>
  );
}