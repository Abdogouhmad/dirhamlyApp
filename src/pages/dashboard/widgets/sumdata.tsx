// ─── DashSummary ──────────────────────────────────────────────────────────────

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type DashSummaryProps = {
  title: string;
  sum: string;
  percentage?: string;
  icon: LucideIcon;
  color: "green" | "red" | "rust";
  currency?: string;
};

export type SummaryItem = {
  id: string;
  title: string;
  sum: string;
  percentage?: string;
  icon: LucideIcon;
  color: "green" | "red" | "rust";
};


export default function DashSummary({
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
