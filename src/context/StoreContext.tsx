import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "@/types/book";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface StoreValue {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  addToCart: (bookId: string, quantity?: number) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  toggleWishlist: (bookId: string) => void;
  isWishlisted: (bookId: string) => boolean;
}

const StoreContext = createContext<StoreValue | undefined>(undefined);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCart(readStorage<CartLine[]>("page-pine-cart", []));
      setWishlist(readStorage<string[]>("page-pine-wishlist", []));
      setHydrated(true);
      return;
    }
    let active = true;
    void Promise.all([
      supabase.from("cart_items").select("book_id, quantity").eq("user_id", user.id),
      supabase.from("wishlist_items").select("book_id").eq("user_id", user.id),
    ]).then(([cartResult, wishlistResult]) => {
      if (!active) return;
      setCart((cartResult.data ?? []).map((row) => ({ bookId: row.book_id, quantity: row.quantity })));
      setWishlist((wishlistResult.data ?? []).map((row) => row.book_id));
      setHydrated(true);
    });
    return () => { active = false; };
  }, [authLoading, user]);

  useEffect(() => {
    if (!hydrated || user) return;
    window.localStorage.setItem("page-pine-cart", JSON.stringify(cart));
  }, [cart, hydrated, user]);
  useEffect(() => {
    if (!hydrated || user) return;
    window.localStorage.setItem("page-pine-wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated, user]);

  const addToCart = useCallback((bookId: string, quantity = 1) => setCart((current) => {
    const found = current.find((line) => line.bookId === bookId);
    const nextQuantity = (found?.quantity ?? 0) + quantity;
    if (user) void supabase.from("cart_items").upsert({ user_id: user.id, book_id: bookId, quantity: nextQuantity });
    return found ? current.map((line) => line.bookId === bookId ? { ...line, quantity: nextQuantity } : line) : [...current, { bookId, quantity }];
  }), [user]);
  const updateQuantity = useCallback((bookId: string, quantity: number) => setCart((current) => {
    if (user) void (quantity < 1 ? supabase.from("cart_items").delete().eq("user_id", user.id).eq("book_id", bookId) : supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("book_id", bookId));
    return quantity < 1 ? current.filter((line) => line.bookId !== bookId) : current.map((line) => line.bookId === bookId ? { ...line, quantity } : line);
  }), [user]);
  const removeFromCart = useCallback((bookId: string) => setCart((current) => {
    if (user) void supabase.from("cart_items").delete().eq("user_id", user.id).eq("book_id", bookId);
    return current.filter((line) => line.bookId !== bookId);
  }), [user]);
  const clearCart = useCallback(() => {
    if (user) void supabase.from("cart_items").delete().eq("user_id", user.id);
    setCart([]);
  }, [user]);
  const toggleWishlist = useCallback((bookId: string) => setWishlist((current) => {
    const exists = current.includes(bookId);
    if (user) void (exists ? supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("book_id", bookId) : supabase.from("wishlist_items").insert({ user_id: user.id, book_id: bookId }));
    return exists ? current.filter((id) => id !== bookId) : [...current, bookId];
  }), [user]);
  const isWishlisted = useCallback((bookId: string) => wishlist.includes(bookId), [wishlist]);
  const value = useMemo(() => ({ cart, wishlist, cartCount: cart.reduce((sum, line) => sum + line.quantity, 0), addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist, isWishlisted }), [cart, wishlist, addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist, isWishlisted]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
