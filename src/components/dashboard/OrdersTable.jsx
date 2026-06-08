const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const statusClass = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300",
  "In Review": "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-300",
  Pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300",
};

export default function OrdersTable({ orders }) {
  return (
    <section className="dashboard-surface animate-panel overflow-hidden rounded-lg" style={{ animationDelay: "260ms" }}>
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Orders</p>
        <h2 className="mt-1 text-lg font-bold">Recent Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order, index) => (
              <tr key={order.id} className="animate-row transition-colors duration-200 hover:bg-muted/30" style={{ animationDelay: `${index * 35}ms` }}>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{order.order_date}</td>
                <td className="px-4 py-3 font-medium">{order.customer_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.product_name}</td>
                <td className="px-4 py-3">{order.region}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass[order.status] ?? "border-border bg-muted text-muted-foreground"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{currency.format(order.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
