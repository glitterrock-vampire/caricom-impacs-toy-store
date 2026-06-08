import { Moon, RefreshCw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardHeader({ onRefresh, isRefreshing, isDark, onToggleTheme }) {
  return (
    <div className="animate-panel flex flex-col gap-4 border-b border-border bg-card/92 px-4 py-5 backdrop-blur transition-colors duration-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CARICOM IMPACS</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Regional Operations Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Monitor orders, revenue, product readiness, and customer coverage from the local SQL store.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          variant="outline"
          onClick={onToggleTheme}
          className="w-full gap-2 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="theme-toggle-icon h-4 w-4 rotate-0" /> : <Moon className="theme-toggle-icon h-4 w-4" />}
          {isDark ? "Light" : "Dark"}
        </Button>
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing} className="w-full gap-2 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
