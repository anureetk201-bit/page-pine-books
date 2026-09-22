import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/integrations/supabase/client";
import { recommendBooks } from "@/lib/recommendations";

export function useRecommendations(limit = 6) {
  const { user } = useAuth();
  const { cart, wishlist } = useStore();
  const [purchased, setPurchased] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setPurchased([]); return; }
    void supabase
      .from("order_items")
      .select("book_id, orders!inner(user_id)")
      .eq("orders.user_id", user.id)
      .then(({ data }) => setPurchased((data ?? []).map((row) => row.book_id)));
  }, [user]);

  const signals = useMemo(
    () => Array.from(new Set([...purchased, ...wishlist, ...cart.map((line) => line.bookId)])),
    [purchased, wishlist, cart],
  );

  return useMemo(
    () => ({ signals, books: recommendBooks(signals, limit), personalized: signals.length > 0 }),
    [signals, limit],
  );
}
