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
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
          Dashboard
        </p>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {name}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-md border border-border hover:border-rust-500 text-muted-foreground hover:text-rust-500 transition-all duration-200 disabled:opacity-50"
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
