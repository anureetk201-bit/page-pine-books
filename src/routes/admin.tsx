import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  MessageSquare,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { InventoryManager } from "@/components/store/InventoryManager";
import { AdminLogin } from "@/components/store/AdminLogin";
import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { BooksPanel } from "@/components/admin/BooksPanel";
import { CustomersPanel } from "@/components/admin/CustomersPanel";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";

const TABS = ["overview", "orders", "books", "inventory", "customers", "reviews"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store dashboard — Page & Pine" },
      {
        name: "description",
        content: "Private Page & Pine dashboard for sales, orders, and customer insights.",
      },
      { property: "og:title", content: "Store dashboard — Page & Pine" },
      { property: "og:description", content: "Private Page & Pine store dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } =>
    TABS.includes(search["tab"] as Tab) && search["tab"] !== "overview"
      ? { tab: search["tab"] as Tab }
      : {},
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  // Tied to the user it was checked for, so switching accounts never shows the previous verdict.
  const [access, setAccess] = useState<{ userId: string; isAdmin: boolean } | null>(null);
  const isAdmin = user && access?.userId === user.id ? access.isAdmin : null;
  const queryClient = useQueryClient();
  const tab = Route.useSearch().tab ?? "overview";
  const navigate = Route.useNavigate();
  const openTab = (next: Tab) => {
    void navigate({ search: next === "overview" ? {} : { tab: next } });
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!user) return;
    let active = true;
    void supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (active) setAccess({ userId: user.id, isAdmin: Boolean(data) });
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || (user && isAdmin === null))
    return (
      <main className="grid min-h-[520px] place-items-center bg-secondary">
        <p className="eyebrow">Checking access…</p>
      </main>
    );

  if (!user) return <AdminLogin />;

  if (isAdmin === false)
    return (
      <main className="grid min-h-[520px] place-items-center bg-secondary px-4 text-center">
        <div className="max-w-md">
          <p className="eyebrow">Store dashboard</p>
          <h1 className="mt-2 font-display text-4xl">Owner access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This account can&apos;t open the store dashboard. Sign out, then sign in with the
            store&apos;s admin ID.
          </p>
          <Button className="mt-6" onClick={() => void supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </main>
    );

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package },
    { id: "books", label: "Books", icon: BookOpen },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "customers", label: "Customers", icon: Users },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ] as const;
  const refreshCatalog = () => void queryClient.invalidateQueries({ queryKey: ["catalog"] });

  return (
    <main className="page-container py-10" data-no-reveal>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Page &amp; Pine</p>
          <h1 className="mt-2 font-display text-5xl">Store dashboard</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            View store <ExternalLink />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav
          aria-label="Dashboard sections"
          className="-mx-1 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col lg:self-start lg:sticky lg:top-24"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => openTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "overview" && <OverviewPanel onOpenTab={openTab} />}
          {tab === "orders" && <OrdersPanel />}
          {tab === "books" && <BooksPanel onChanged={refreshCatalog} />}
          {tab === "inventory" && <InventoryManager onChanged={refreshCatalog} />}
          {tab === "customers" && <CustomersPanel />}
          {tab === "reviews" && <ReviewsPanel />}
        </div>
      </div>
    </main>
  );
}
