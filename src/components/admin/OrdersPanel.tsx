import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import {
  ORDER_SELECT,
  ORDER_STATUSES,
  PanelHeader,
  StatusBadge,
  formatDate,
  inputClass,
  orderContact,
  type AdminOrder,
} from "./shared";

export function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setMessage(error.message);
    setOrders((data ?? []) as unknown as AdminOrder[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(order: AdminOrder, next: string) {
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", order.id);
    setMessage(error ? error.message : `Order #${order.id.slice(0, 8)} marked ${next}.`);
    if (!error)
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
  }

  const needle = query.trim().toLowerCase();
  const visible = orders.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (!needle) return true;
    const { name, email } = orderContact(o);
    return [o.id, name, email].some((v) => v.toLowerCase().includes(needle));
  });

  return (
    <section>
      <PanelHeader
        title="Orders"
        description={`${orders.length} orders · ${orders.filter((o) => o.status === "confirmed").length} new`}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order, name or email"
          aria-label="Search orders"
          className={`${inputClass} w-60`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className={`${inputClass} w-40 capitalize`}
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </PanelHeader>
      {message && (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}

      <div className="mt-5 space-y-3">
        {visible.length === 0 && (
          <p className="border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No orders match.
          </p>
        )}
        {visible.map((order) => {
          const { name, email } = orderContact(order);
          const expanded = open === order.id;
          const address = order.shipping_address ?? {};
          return (
            <article key={order.id} className="border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <button
                  className="flex items-center gap-3 text-left"
                  onClick={() => setOpen(expanded ? null : order.id)}
                  aria-expanded={expanded}
                >
                  <ChevronDown
                    className={`size-4 shrink-0 transition ${expanded ? "rotate-180" : ""}`}
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      #{order.id.slice(0, 8)} · {name || "Reader"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(order.created_at)} ·{" "}
                      {order.order_items.reduce((s, i) => s + i.quantity, 0)} books ·{" "}
                      {order.payment_method}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <strong className="font-display text-xl">
                    {formatPrice(Number(order.total))}
                  </strong>
                  <select
                    value={order.status}
                    onChange={(e) => void updateStatus(order, e.target.value)}
                    aria-label={`Change status of order ${order.id.slice(0, 8)}`}
                    className="h-9 border border-input bg-background px-2 text-xs capitalize"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {expanded && (
                <div className="grid gap-6 border-t border-border px-5 py-5 text-sm md:grid-cols-2">
                  <div>
                    <p className="eyebrow">Items</p>
                    <ul className="mt-2 space-y-1.5">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-4">
                          <span>
                            {item.title} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.unit_price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow">Ship to</p>
                    <p className="mt-2 leading-6">
                      {name}
                      <br />
                      {address["Address"]}
                      <br />
                      {[address["City"], address["State"], address["Postal code"]]
                        .filter(Boolean)
                        .join(", ")}
                      <br />
                      {address["Country"]}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {email}
                      {address["Phone"] ? ` · ${address["Phone"]}` : ""}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
