import React, { useState } from "react";
import { customersApi } from "@/api/sqlClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COUNTRIES = ["Jamaica", "Trinidad & Tobago", "Barbados", "Guyana", "Bahamas", "Suriname", "Belize", "Haiti"];
const SEGMENTS = ["Retail", "Wholesale", "Education"];

const segmentStyles = {
  Retail: "bg-blue-50 text-blue-700 border-blue-200 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300",
  Wholesale: "bg-purple-50 text-purple-700 border-purple-200 dark:border-purple-900/70 dark:bg-purple-950/50 dark:text-purple-300",
  Education: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300",
};

const EMPTY = { name: "", email: "", country: "", segment: "" };

function CustomerForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canSave = form.name && form.email && form.country && form.segment;

  return (
    <form
      className="animate-panel grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) onSave(form);
      }}
    >
      <div className="space-y-1">
        <Label className="text-xs">Name</Label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Company name" className="h-9" required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Email</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" className="h-9" required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Country</Label>
        <select
          value={form.country}
          onChange={(e) => set("country", e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option value="">Select...</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Segment</Label>
        <select
          value={form.segment}
          onChange={(e) => set("segment", e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option value="">Select...</option>
          {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1"><X className="h-3.5 w-3.5" />Cancel</Button>
        <Button type="submit" size="sm" disabled={!canSave} className="gap-1">
          <Check className="h-3.5 w-3.5" />Save
        </Button>
      </div>
    </form>
  );
}

export default function CustomersManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersApi.list("name", 100),
  });

  const create = useMutation({
    mutationFn: (data) => customersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setEditing(null); },
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => customersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setEditing(null); },
  });

  const remove = useMutation({
    mutationFn: (id) => customersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });

  const isMutating = create.isPending || update.isPending || remove.isPending;
  const mutationError = create.error || update.error || remove.error;

  return (
    <section className="dashboard-surface animate-panel overflow-hidden rounded-lg" style={{ animationDelay: "440ms" }}>
      <div className="border-b border-border px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer Base</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">Customers</h2>
        </div>
        <Button size="sm" onClick={() => setEditing("new")} className="gap-1.5 rounded-xl text-xs transition-transform duration-200 hover:-translate-y-0.5">
          <Plus className="h-3.5 w-3.5" />Add Customer
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {editing === "new" && (
          <CustomerForm onSave={(data) => create.mutate(data)} onCancel={() => setEditing(null)} />
        )}

        {mutationError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {mutationError.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Segment</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c, index) => (
                <React.Fragment key={c.id}>
                  <tr className="animate-row transition-colors duration-200 hover:bg-muted/30" style={{ animationDelay: `${index * 35}ms` }}>
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-foreground">{c.country}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${segmentStyles[c.segment] || "bg-muted text-muted-foreground"}`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(c.id)} disabled={isMutating}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove.mutate(c.id)} disabled={isMutating}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editing === c.id && (
                    <tr key={`edit-${c.id}`}>
                      <td colSpan={5} className="px-4 py-2">
                        <CustomerForm
                          initial={c}
                          onSave={(data) => update.mutate({ id: c.id, data })}
                          onCancel={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
