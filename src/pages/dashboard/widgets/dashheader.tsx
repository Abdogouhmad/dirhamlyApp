import { RefreshCw } from "lucide-react";

export default function DashHeader({
  name = "Abderrahman",
  onRefresh,
  refreshing,
}: {
  name?: string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex items-center justify-between w-full pb-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Good morning, {name} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here’s what’s happening with your finances today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2.5 rounded-xl border border-border hover:border-cobalt-300 text-muted-foreground hover:text-cobalt-300 transition-all duration-200 disabled:opacity-50 bg-white/5 backdrop-blur-sm"
          title="Refresh data"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
