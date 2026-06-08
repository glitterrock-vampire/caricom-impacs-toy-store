export default function CustomersTable({ customers }) {
  return (
    <section className="dashboard-surface animate-panel overflow-hidden rounded-lg" style={{ animationDelay: "320ms" }}>
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Coverage</p>
        <h2 className="mt-1 text-lg font-bold">Customer Footprint</h2>
      </div>
      <div className="divide-y divide-border">
        {customers.slice(0, 6).map((customer, index) => (
          <div key={customer.id} className="animate-row grid grid-cols-1 gap-1 px-5 py-3 transition-colors duration-200 hover:bg-muted/30 sm:grid-cols-[1fr_auto] sm:items-center" style={{ animationDelay: `${index * 45}ms` }}>
            <div>
              <p className="font-medium text-foreground">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{customer.country}</span>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground transition-colors">{customer.segment}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
