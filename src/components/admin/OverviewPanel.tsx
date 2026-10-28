import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import {
  Metric,
  ORDER_SELECT,
  PanelHeader,
  StatusBadge,
  formatDate,
  orderContact,
  type AdminOrder,
} from "./shared";

interface LowStock {
  id: string;
  title: string;
  stock_quantity: number;
  low_stock_threshold: number;
}

const DAYS = 30;

export function OverviewPanel({ onOpenTab }: { onOpenTab: (tab: "orders" | "inventory") => void }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState(0);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);

  useEffect(() => {
    void Promise.all([
      supabase
        .from("orders")
        .select(ORDER_SELECT)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("books")
        .select("id, title, stock_quantity, low_stock_threshold")
        .order("stock_quantity"),
    ]).then(([orderResult, profileResult, bookResult]) => {
      setOrders((orderResult.data ?? []) as unknown as AdminOrder[]);
      setCustomers(profileResult.count ?? 0);
      setLowStock((bookResult.data ?? []).filter((b) => b.stock_quantity <= b.low_stock_threshold));
    });
  }, []);

  const paid = orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((sum, o) => sum + Number(o.total), 0);
  const unitsSold = paid.flatMap((o) => o.order_items).reduce((sum, i) => sum + i.quantity, 0);
  const openOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "processing",
  ).length;

  // Revenue per day for the last 30 days, including days with no sales.
  const daily = useMemo(() => {
    const byDay = new Map<string, number>();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      byDay.set(d.toDateString(), 0);
    }
    for (const o of paid) {
      const key = new Date(o.created_at).toDateString();
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total));
    }
    return Array.from(byDay, ([day, total]) => ({
      label: new Date(day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      total,
    }));
  }, [paid]);
  const monthRevenue = daily.reduce((sum, d) => sum + d.total, 0);

  const titleTotals = new Map<string, number>();
  for (const item of paid.flatMap((o) => o.order_items))
    titleTotals.set(item.title, (titleTotals.get(item.title) ?? 0) + item.quantity);
  const topTitles = Array.from(titleTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Revenue"
          value={formatPrice(revenue)}
          hint={`${formatPrice(monthRevenue)} in the last ${DAYS} days`}
        />
        <Metric
          label="Orders"
          value={String(orders.length)}
          hint={`${openOrders} waiting to ship`}
        />
        <Metric label="Books sold" value={String(unitsSold)} />
        <Metric label="Readers" value={String(customers)} hint="Registered accounts" />
      </div>

      <section className="border border-border bg-card p-5">
        <h3 className="font-display text-2xl">Daily revenue</h3>
        <p className="text-xs text-muted-foreground">
          Last {DAYS} days, excluding cancelled orders
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={daily}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              barCategoryGap={2}
            >
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.6} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={6}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(v: number) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.6 }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="text-muted-foreground">{String(payload[0].payload.label)}</p>
                      <p className="font-semibold">{formatPrice(Number(payload[0].value))}</p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="total"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <PanelHeader title="Recent orders">
            <button className="text-xs underline" onClick={() => onOpenTab("orders")}>
              All orders
            </button>
          </PanelHeader>
          {orders.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No orders have been placed yet.</p>
          )}
          <div className="mt-5 divide-y divide-border border border-border bg-card">
            {orders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    #{order.id.slice(0, 8)}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {orderContact(order).name || "Reader"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <strong className="font-display text-lg">
                    {formatPrice(Number(order.total))}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-10">
          <section>
            <PanelHeader title="Low stock">
              <button className="text-xs underline" onClick={() => onOpenTab("inventory")}>
                Inventory
              </button>
            </PanelHeader>
            {lowStock.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">Every title is well stocked.</p>
            )}
            <ul className="mt-5 divide-y divide-border border border-border bg-card">
              {lowStock.slice(0, 6).map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <span className="font-medium">{b.title}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
                    <AlertTriangle className="size-3.5" /> {b.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <PanelHeader title="Best sellers" />
            {topTitles.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">Sales will appear here.</p>
            )}
            <ul className="mt-5 divide-y divide-border border border-border bg-card">
              {topTitles.map(([title, quantity]) => (
                <li
                  key={title}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <span className="font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground">{quantity} sold</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
