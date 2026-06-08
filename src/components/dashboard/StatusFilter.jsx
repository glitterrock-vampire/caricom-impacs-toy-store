const statuses = ["all", "Completed", "In Review", "Pending"];

export default function StatusFilter({ value, onChange, counts = {} }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const active = value === status;
        const label = status === "all" ? "All" : status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
            <span className={`rounded-sm px-1.5 py-0.5 text-xs ${active ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
              {counts[status] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
