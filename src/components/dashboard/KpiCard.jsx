export default function KpiCard({ title, value, detail, icon: Icon, tone = "text-primary" }) {
  return (
    <div className="dashboard-surface animate-panel group rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        {Icon && (
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted transition-transform duration-300 group-hover:scale-105 ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {detail && <p className="mt-3 text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}
