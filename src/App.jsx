import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, PackageCheck, ReceiptText, Users } from "lucide-react";
import { customersApi, ordersApi, productsApi } from "@/api/sqlClient";
import CategoryChart from "@/components/dashboard/CategoryChart";
import CustomersManager from "@/components/dashboard/CustomersManager";
import CustomersTable from "@/components/dashboard/CustomersTable";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ExportPanel from "@/components/dashboard/ExportPanel";
import KpiCard from "@/components/dashboard/KpiCard";
import OrdersTable from "@/components/dashboard/OrdersTable";
import ProductsManager from "@/components/dashboard/ProductsManager";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatusFilter from "@/components/dashboard/StatusFilter";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function App() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("caricom-theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("caricom-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersApi.list("name", 200),
  });
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list("name", 200),
  });
  const ordersQuery = useQuery({
    queryKey: ["orders", status],
    queryFn: () => ordersApi.list(status, 200),
  });
  const allOrdersQuery = useQuery({
    queryKey: ["orders", "all-counts"],
    queryFn: () => ordersApi.list("all", 200),
  });

  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const allOrders = allOrdersQuery.data ?? [];
  const isRefreshing = customersQuery.isFetching || productsQuery.isFetching || ordersQuery.isFetching || allOrdersQuery.isFetching;

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const pending = allOrders.filter((order) => order.status !== "Completed").length;
    const counts = allOrders.reduce(
      (acc, order) => {
        acc.all += 1;
        acc[order.status] = (acc[order.status] ?? 0) + 1;
        return acc;
      },
      { all: 0 },
    );

    return {
      revenue,
      pending,
      counts,
      activeProducts: products.filter((product) => product.status === "Active").length,
    };
  }, [orders, allOrders, products]);

  function refreshAll() {
    queryClient.invalidateQueries();
  }

  return (
    <main className="app-shell min-h-screen transition-colors duration-300">
      <DashboardHeader onRefresh={refreshAll} isRefreshing={isRefreshing} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Filtered Revenue" value={currency.format(stats.revenue)} detail={`${orders.length} orders in current view`} icon={Database} />
          <KpiCard title="Customers" value={customers.length} detail="Regional accounts tracked" icon={Users} tone="text-emerald-600 dark:text-emerald-300" />
          <KpiCard title="Active Products" value={stats.activeProducts} detail={`${products.length} total catalog items`} icon={PackageCheck} tone="text-amber-600 dark:text-amber-300" />
          <KpiCard title="Open Orders" value={stats.pending} detail="Pending or in review" icon={ReceiptText} tone="text-sky-600 dark:text-sky-300" />
        </div>

        <div className="dashboard-surface animate-panel flex flex-col gap-3 rounded-lg p-4 lg:flex-row lg:items-center lg:justify-between" style={{ animationDelay: "120ms" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Filter</p>
            <h2 className="mt-1 text-lg font-bold">Order Status</h2>
          </div>
          <StatusFilter value={status} onChange={setStatus} counts={stats.counts} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <RevenueChart orders={orders} />
          <CategoryChart orders={orders} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <OrdersTable orders={orders} />
          <div className="space-y-6">
            <CustomersTable customers={customers} />
            <ExportPanel orders={orders} customers={customers} products={products} />
          </div>
        </div>

        <ProductsManager products={products} />
        <CustomersManager />
      </div>
    </main>
  );
}
