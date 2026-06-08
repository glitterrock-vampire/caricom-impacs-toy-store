import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function downloadCsv(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel({ orders, customers, products }) {
  return (
    <section className="dashboard-surface animate-panel rounded-lg p-5" style={{ animationDelay: "360ms" }}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Exports</p>
      <h2 className="mt-1 text-lg font-bold">Download Data</h2>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="outline" className="gap-2 transition-transform duration-200 hover:-translate-y-0.5" onClick={() => downloadCsv("orders.csv", orders)}>
          <Download className="h-4 w-4" />Orders
        </Button>
        <Button variant="outline" className="gap-2 transition-transform duration-200 hover:-translate-y-0.5" onClick={() => downloadCsv("customers.csv", customers)}>
          <Download className="h-4 w-4" />Customers
        </Button>
        <Button variant="outline" className="gap-2 transition-transform duration-200 hover:-translate-y-0.5" onClick={() => downloadCsv("products.csv", products)}>
          <Download className="h-4 w-4" />Products
        </Button>
      </div>
    </section>
  );
}
