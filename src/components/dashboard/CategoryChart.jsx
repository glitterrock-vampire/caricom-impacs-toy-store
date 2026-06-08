const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const colors = ["bg-primary", "bg-emerald-600", "bg-amber-500", "bg-sky-500", "bg-rose-500", "bg-slate-500"];

export default function CategoryChart({ orders }) {
  const categories = orders.reduce((acc, order) => {
    acc[order.product_category] = (acc[order.product_category] ?? 0) + Number(order.total_amount);
    return acc;
  }, {});

  const rows = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;

  return (
    <section className="dashboard-surface animate-panel rounded-lg p-5" style={{ animationDelay: "220ms" }}>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Product Mix</p>
        <h2 className="mt-1 text-lg font-bold">Revenue by Category</h2>
      </div>
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{row.name}</span>
              <span className="text-muted-foreground">{currency.format(row.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`chart-bar h-2 rounded-full ${colors[index % colors.length]}`} style={{ width: `${(row.value / total) * 100}%`, animationDelay: `${index * 70}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
