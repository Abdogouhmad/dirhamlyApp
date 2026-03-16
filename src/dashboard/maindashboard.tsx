import { TypographyH2 } from "@/components/ui/text";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DataTable } from "./table";
import { TableData, TableColumes } from "./tabledata";
import { ChartBarDefault } from "./chart";
import { ChartPieInteractive } from "./piechart";
type DashboardProps = {
  name?: string;
  balance?: string;
};

type SummaryItem = {
  id: string;
  title: string;
  sum: string;
  percentage?: string;
  icon: LucideIcon;
  color: "green" | "red" | "rust";
};

export function Dashboard() {
  const summaryData: SummaryItem[] = [
    {
      id: "income",
      title: "Income",
      sum: "45,000.00",
      percentage: "+12.5%",
      icon: TrendingUp,
      color: "green",
    },
    {
      id: "expense",
      title: "Expense",
      sum: "12,600.00",
      percentage: "-2.4%",
      icon: TrendingDown,
      color: "red",
    },
    {
      id: "balance",
      title: "Net Sevings",
      sum: "32,4.00",
      icon: Wallet,
      color: "rust",
    },
  ];

  return (
    <div className="min-h-screen selection:bg-[#4ade80]/30 p-6 space-y-6">
      {/* Header + Summary Cards */}
      <DashHeader name="Abdo" balance="32,400.00 MAD" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryData.map((item) => (
          <DashSummary key={item.id} {...item} />
        ))}
      </div>

      {/* Table + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table */}
        <div className="lg:col-span-7">
          <DataTable columns={TableColumes} data={TableData} />
        </div>

        {/* Charts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full max-w-full">
            <ChartBarDefault />
          </div>
          <div className="w-full max-w-full">
            <ChartPieInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashHeader({
  name = "Abderrahman",
  balance = "80,000.00 MAD",
}: DashboardProps) {
  return (
    <div className="flex items-center justify-between w-full pb-5 ">
      <TypographyH2 text={`Welcome back, ${name}`} />

      <div className="px-6 py-2 rounded-md border border-rust-500 flex flex-col items-center shadow-inner">
        <span className="text-[10px] uppercase tracking-widest text-rust-500 font-bold mb-1">
          Current Balance
        </span>

        <span className="font-bold text-lg tracking-tight">{balance}</span>
      </div>
    </div>
  );
}

type DashSummaryProps = {
  title: string;
  sum: string;
  percentage?: string;
  icon: LucideIcon;
  color: "green" | "red" | "rust";
  currency?: string;
};

function DashSummary({
  title,
  sum,
  percentage,
  icon: Icon,
  color,
  currency = "MAD",
}: DashSummaryProps) {
  const styles = {
    green: {
      icon: "text-green-600/70 dark:text-green-500/80",
      bg: "bg-green-500/50 dark:bg-green-800/50 border-green-500/50 dark:border-green-800/50",
      badge: "bg-green-400/70 dark:bg-green-800/50 dark:text-green-400",
    },
    red: {
      icon: "text-red-600/70 dark:text-red-500/80",
      bg: "bg-red-500/50 dark:bg-red-800/50 border-red-500/50 dark:border-red-800/50",
      badge: "bg-red-400/70 dark:bg-red-800/50 dark:text-red-400",
    },
    rust: {
      icon: "text-rust-600/70 dark:text-rust-500/80",
      bg: "bg-rust-500/50 dark:bg-rust-800/50 border-rust-500/50 dark:border-rust-800/50",
      badge: "bg-rust-400/70 dark:bg-rust-800/50 text-rust-300",
    },
  };

  const s = styles[color];

  return (
    <Card className="relative overflow-hidden border rounded-sm border-rust-600/50 hover:border-rust-600 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div
          className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 ${s.bg}`}
        >
          <Icon className={`size-5 ${s.icon}`} />
        </div>

        {percentage && (
          <Badge
            variant="outline"
            className={`font-bold border-none ${s.badge}`}
          >
            {percentage}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        <p className="text-sm font-semibold dark:text-neutral-300 text-neutral-700">
          {title}
        </p>

        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold tracking-tight">{sum}</h2>

          <span className="text-xs font-bold dark:text-neutral-300 text-neutral-700 mb-1">
            {currency}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
