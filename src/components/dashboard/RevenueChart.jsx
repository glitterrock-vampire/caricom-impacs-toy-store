const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function monthKey(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

export default function RevenueChart({ orders }) {
  const data = orders.reduce((acc, order) => {
    const key = monthKey(order.order_date);
    const parsed = new Date(`${order.order_date}T00:00:00`);
    acc[key] ??= { label: monthFormatter.format(parsed), value: 0 };
    acc[key].value += Number(order.total_amount);
    return acc;
  }, {});

  const rows = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="dashboard-surface animate-panel rounded-lg p-5" style={{ animationDelay: "160ms" }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Revenue</p>
          <h2 className="mt-1 text-lg font-bold">Monthly Trend</h2>
        </div>
        <p className="text-sm font-semibold text-primary">{currency.format(rows.reduce((sum, row) => sum + row.value, 0))}</p>
      </div>
      <div className="flex h-64 items-end gap-3 border-b border-l border-border px-2 pt-4">
        {rows.map((row) => (
          <div key={row.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-48 w-full items-end">
              <div
                className="chart-bar w-full rounded-t-md bg-primary/80 transition-all duration-300 hover:bg-primary"
                style={{ height: `${Math.max((row.value / max) * 100, 4)}%` }}
                title={`${row.label}: ${currency.format(row.value)}`}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{row.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
