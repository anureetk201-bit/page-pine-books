import type { ReactNode } from "react";

export const ORDER_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const inputClass =
  "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  user_id: string;
  payment_method: string;
  shipping_address: Record<string, string> | null;
  order_items: { id: number; title: string; quantity: number; unit_price: number }[];
}

export const ORDER_SELECT =
  "id, status, total, created_at, user_id, payment_method, shipping_address, order_items(id, title, quantity, unit_price)";

const statusStyles: Record<string, string> = {
  confirmed: "border-primary/30 bg-primary/10 text-primary",
  processing: "border-accent/50 bg-accent/15 text-accent-foreground",
  shipped: "border-ring/40 bg-ring/10 text-primary",
  delivered: "border-primary bg-primary text-primary-foreground",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[status] ?? statusStyles["confirmed"]}`}
    >
      {status}
    </span>
  );
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PanelHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="section-heading">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

/** The customer's name and email as entered at checkout. */
export function orderContact(order: AdminOrder) {
  const address = order.shipping_address ?? {};
  return { name: address["Full name"] ?? address["Name"] ?? "", email: address["Email"] ?? "" };
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
