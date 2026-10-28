import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { PanelHeader, formatDate, inputClass } from "./shared";

interface Customer {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: number;
  lastOrder: string | null;
}

export function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("user_id, total, status, created_at, shipping_address")
        .order("created_at", { ascending: false }),
    ]).then(([profileResult, orderResult]) => {
      if (profileResult.error) setMessage(profileResult.error.message);
      const orders = orderResult.data ?? [];
      setCustomers(
        (profileResult.data ?? []).map((p) => {
          const own = orders.filter((o) => o.user_id === p.id);
          const paid = own.filter((o) => o.status !== "cancelled");
          // Emails live in the auth system; the latest checkout form is the best source available here.
          const address = (own[0]?.shipping_address ?? {}) as Record<string, string>;
          return {
            id: p.id,
            name: p.full_name || address["Full name"] || "Unnamed reader",
            email: address["Email"] ?? "",
            joined: p.created_at,
            orders: own.length,
            spent: paid.reduce((s, o) => s + Number(o.total), 0),
            lastOrder: own[0]?.created_at ?? null,
          };
        }),
      );
    });
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = customers.filter(
    (c) =>
      !needle || c.name.toLowerCase().includes(needle) || c.email.toLowerCase().includes(needle),
  );
  const buyers = customers.filter((c) => c.orders > 0).length;

  return (
    <section>
      <PanelHeader
        title="Customers"
        description={`${customers.length} registered readers · ${buyers} have ordered`}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          aria-label="Search customers"
          className={`${inputClass} w-60`}
        />
      </PanelHeader>
      {message && (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
      <div className="mt-5 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Reader</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Total spent</th>
              <th className="px-5 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <span className="font-medium">{c.name}</span>
                  {c.email && (
                    <span className="block text-xs text-muted-foreground">{c.email}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(c.joined)}</td>
                <td className="px-5 py-3">{c.orders}</td>
                <td className="px-5 py-3">{formatPrice(c.spent)}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {c.lastOrder ? formatDate(c.lastOrder) : "—"}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No readers match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
