import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RecommendedForYou } from "@/components/store/RecommendedForYou";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order history — Page & Pine" },
      {
        name: "description",
        content:
          "Review every Page & Pine order you have placed, with titles, totals, and delivery details.",
      },
      { property: "og:title", content: "Order history — Page & Pine" },
      { property: "og:description", content: "Every Page & Pine order you have placed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

interface OrderRow {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
  shipping_address: unknown;
  order_items: {
    id: number;
    title: string;
    quantity: number;
    unit_price: number;
    book_id: string;
  }[];
}

function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders(null);
      return;
    }
    void supabase
      .from("orders")
      .select(
        "id, status, total, created_at, payment_method, shipping_address, order_items(id, title, quantity, unit_price, book_id)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as OrderRow[]));
  }, [user]);

  if (loading)
    return (
      <main className="grid min-h-[520px] place-items-center bg-secondary">
        <p className="eyebrow">Loading your orders…</p>
      </main>
    );

  if (!user)
    return (
      <main className="grid min-h-[520px] place-items-center bg-secondary px-4 text-center">
        <div>
          <p className="eyebrow">Order history</p>
          <h1 className="mt-2 font-display text-4xl">Sign in to see your orders</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Your purchases are saved to your reader account, so they follow you across devices.
          </p>
          <Button asChild className="mt-6">
            <Link to="/account">Go to account</Link>
          </Button>
        </div>
      </main>
    );

  return (
    <main className="page-container py-14">
      <p className="eyebrow">Reader account</p>
      <h1 className="mt-2 font-display text-5xl">Order history</h1>

      {orders === null && (
        <p className="mt-8 text-sm text-muted-foreground">Fetching your orders…</p>
      )}

      {orders !== null && orders.length === 0 && (
        <div className="mt-10 border border-border bg-card p-10 text-center">
          <PackageCheck className="mx-auto size-8 stroke-[1.3]" />
          <h2 className="mt-3 font-display text-2xl">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When you place an order it will appear here with every title and total.
          </p>
          <Button asChild className="mt-6">
            <Link to="/books">Start browsing</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {(orders ?? []).map((order) => (
          <article key={order.id} className="border border-border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <p className="eyebrow">Order #{order.id.slice(0, 8)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {order.payment_method}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">
                  {order.status}
                </span>
                <strong className="font-display text-2xl">
                  {formatPrice(Number(order.total))}
                </strong>
              </div>
            </header>
            <ul className="divide-y divide-border">
              {order.order_items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <Link
                    to="/books/$id"
                    params={{ id: item.book_id }}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Qty {item.quantity} · {formatPrice(Number(item.unit_price))}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <RecommendedForYou className="mt-16" />
    </main>
  );
}
