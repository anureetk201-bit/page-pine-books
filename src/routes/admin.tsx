import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { InventoryManager } from "@/components/store/InventoryManager";
import { AddBookForm } from "@/components/store/AddBookForm";
import { AdminLogin } from "@/components/store/AdminLogin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Store dashboard — Page & Pine" },
    { name: "description", content: "Private Page & Pine dashboard for sales, orders, and customer insights." },
    { property: "og:title", content: "Store dashboard — Page & Pine" },
    { property: "og:description", content: "Private Page & Pine store dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminPage,
});

interface AdminOrder {
  id: string; status: string; total: number; created_at: string; user_id: string;
  order_items: { id: number; title: string; quantity: number; unit_price: number }[];
}

function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const [orderResult, profileResult] = await Promise.all([
      supabase.from("orders").select("id, status, total, created_at, user_id, order_items(id, title, quantity, unit_price)").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    setOrders((orderResult.data ?? []) as unknown as AdminOrder[]);
    setCustomers(profileResult.count ?? 0);
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(null); return; }
    void supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(async ({ data }) => {
      setIsAdmin(Boolean(data));
      if (data) await loadData();
    });
  }, [user, loadData]);

  async function claimAdmin() {
    setBusy(true); setMessage("");
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) setMessage(error.message);
    else if (data) { setIsAdmin(true); await loadData(); }
    else setMessage("This store already has an owner. Ask them to grant you access.");
    setBusy(false);
  }

  async function markDelivered(id: string) {
    await supabase.from("orders").update({ status: "delivered" }).eq("id", id);
    await loadData();
  }

  if (loading) return <main className="grid min-h-[520px] place-items-center bg-secondary"><p className="eyebrow">Checking access…</p></main>;

  if (!user) return <AdminLogin />;

  if (isAdmin === false) return (
    <main className="grid min-h-[520px] place-items-center bg-secondary px-4 text-center">
      <div className="max-w-md">
        <p className="eyebrow">Store dashboard</p>
        <h1 className="mt-2 font-display text-4xl">Owner access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">If this is your store and nobody has claimed it yet, you can take ownership now.</p>
        <Button className="mt-6" disabled={busy} onClick={() => void claimAdmin()}>{busy ? "Please wait…" : "Claim store ownership"}</Button>
        {message && <p className="mt-4 text-xs text-muted-foreground" role="status">{message}</p>}
      </div>
    </main>
  );

  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const unitsSold = orders.flatMap((order) => order.order_items).reduce((sum, item) => sum + item.quantity, 0);
  const titleTotals = new Map<string, number>();
  for (const item of orders.flatMap((order) => order.order_items)) titleTotals.set(item.title, (titleTotals.get(item.title) ?? 0) + item.quantity);
  const topTitles = Array.from(titleTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <main className="page-container py-14">
      <p className="eyebrow">Page &amp; Pine</p>
      <h1 className="mt-2 font-display text-5xl">Store dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Revenue" value={formatPrice(revenue)} />
        <Metric label="Orders" value={String(orders.length)} />
        <Metric label="Books sold" value={String(unitsSold)} />
        <Metric label="Readers" value={String(customers)} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="recent-orders">
          <h2 id="recent-orders" className="section-heading">Recent orders</h2>
          {orders.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No orders have been placed yet.</p>}
          <div className="mt-5 space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">#{order.id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} · {order.order_items.length} title{order.order_items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">{order.status}</span>
                  <strong className="font-display text-xl">${Number(order.total).toFixed(2)}</strong>
                  {order.status !== "delivered" && (
                    <Button size="sm" variant="outline" onClick={() => void markDelivered(order.id)}>Mark delivered</Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="top-titles">
          <h2 id="top-titles" className="section-heading">Best performing titles</h2>
          {topTitles.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Sales will appear here.</p>}
          <ul className="mt-5 divide-y divide-border border border-border bg-card">
            {topTitles.map(([title, quantity]) => (
              <li key={title} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="font-medium">{title}</span>
                <span className="text-xs text-muted-foreground">{quantity} sold</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AddBookForm />
      <InventoryManager />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-border bg-card p-5"><p className="eyebrow">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>;
}
