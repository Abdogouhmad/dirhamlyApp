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
  percentage?: string; // ← now part of the type
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
      icon: "text-jade-600/70 dark:text-jade-500/80",
      bg: "bg-jade-500/50 dark:bg-jade-800/50 border-jade-500/50 dark:border-jade-800/50",
      badge: "bg-jade-400/70 dark:bg-jade-800/50 dark:text-jade-400",
    },
    red: {
      icon: "text-ember-600/70 dark:text-ember-500/80",
      bg: "bg-ember-500/50 dark:bg-ember-800/50 border-ember-500/50 dark:border-ember-800/50",
      badge: "bg-ember-400/70 dark:bg-ember-800/50 dark:text-ember-400",
    },
    rust: {
      icon: "text-gold-600/70 dark:text-gold-300/80",
      bg: "bg-gold-300/50 dark:bg-gold-800/50 border-gold-300/50 dark:border-gold-800/50",
      badge: "bg-cobalt-400/70 dark:bg-cobalt-800/50 dark:text-gold-300",
    },
  };

  const s = styles[color];

  return (
    <Card className="relative overflow-hidden border rounded-sm border-cobalt-300/50 hover:border-cobalt-300 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div
          className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 ${s.bg}`}
        >
          <Icon className={`size-5 ${s.icon}`} />
        </div>
        {percentage && (
          <Badge
            variant="outline"
            className={`font-bold border-none text-xs ${s.badge}`}
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
