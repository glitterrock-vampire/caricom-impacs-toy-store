import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { productsApi } from "@/api/sqlClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categories = ["Intelligence", "Border Operations", "Training", "Compliance", "Infrastructure"];
const statuses = ["Active", "Paused", "Retired"];
const emptyProduct = { name: "", category: "", unit_price: "", stock: "", status: "Active" };
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function ProductForm({ initial = emptyProduct, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...initial,
    unit_price: String(initial.unit_price ?? ""),
    stock: String(initial.stock ?? ""),
  });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const canSave = form.name && form.category && form.unit_price && form.stock !== "" && form.status;

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) onSave({ ...form, unit_price: Number(form.unit_price), stock: Number(form.stock) });
      }}
    >
      <div className="space-y-1">
        <Label className="text-xs">Product</Label>
        <Input value={form.name} onChange={(event) => set("name", event.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Category</Label>
        <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.category} onChange={(event) => set("category", event.target.value)} required>
          <option value="">Select...</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Unit Price</Label>
        <Input type="number" min="0" value={form.unit_price} onChange={(event) => set("unit_price", event.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Stock</Label>
        <Input type="number" min="0" step="1" value={form.stock} onChange={(event) => set("stock", event.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.status} onChange={(event) => set("status", event.target.value)} required>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-5">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1"><X className="h-3.5 w-3.5" />Cancel</Button>
        <Button size="sm" type="submit" disabled={!canSave} className="gap-1"><Check className="h-3.5 w-3.5" />Save</Button>
      </div>
    </form>
  );
}

export default function ProductsManager({ products }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  const create = useMutation({
    mutationFn: (data) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <section className="dashboard-surface animate-panel overflow-hidden rounded-lg" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Catalog</p>
          <h2 className="mt-1 text-lg font-bold">Products</h2>
        </div>
          <Button size="sm" onClick={() => setEditing("new")} className="gap-1 transition-transform duration-200 hover:-translate-y-0.5"><Plus className="h-4 w-4" />Add</Button>
      </div>
      <div className="space-y-3 p-4">
        {editing === "new" && <ProductForm onSave={(data) => create.mutate(data)} onCancel={() => setEditing(null)} />}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <FragmentRow
                  key={product.id}
                  product={product}
                  editing={editing}
                  setEditing={setEditing}
                  onUpdate={(data) => update.mutate({ id: product.id, data })}
                  onDelete={() => remove.mutate(product.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FragmentRow({ product, editing, setEditing, onUpdate, onDelete }) {
  return (
    <>
      <tr className="animate-row transition-colors duration-200 hover:bg-muted/30">
        <td className="px-4 py-3 font-medium">{product.name}</td>
        <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
        <td className="px-4 py-3 text-right font-semibold">{currency.format(product.unit_price)}</td>
        <td className="px-4 py-3 text-right">{product.stock}</td>
        <td className="px-4 py-3">
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground transition-colors">{product.status}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(product.id)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </td>
      </tr>
      {editing === product.id && (
        <tr>
          <td colSpan={6} className="px-4 py-2">
            <ProductForm initial={product} onSave={onUpdate} onCancel={() => setEditing(null)} />
          </td>
        </tr>
      )}
    </>
  );
}
