import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "@/types/book";

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
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStorage<CartLine[]>("page-pine-cart", []));
    setWishlist(readStorage<string[]>("page-pine-wishlist", []));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem("page-pine-cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) window.localStorage.setItem("page-pine-wishlist", JSON.stringify(wishlist)); }, [wishlist, hydrated]);

  const addToCart = useCallback((bookId: string, quantity = 1) => setCart((current) => {
    const found = current.find((line) => line.bookId === bookId);
    return found ? current.map((line) => line.bookId === bookId ? { ...line, quantity: line.quantity + quantity } : line) : [...current, { bookId, quantity }];
  }), []);
  const updateQuantity = useCallback((bookId: string, quantity: number) => setCart((current) => quantity < 1 ? current.filter((line) => line.bookId !== bookId) : current.map((line) => line.bookId === bookId ? { ...line, quantity } : line)), []);
  const removeFromCart = useCallback((bookId: string) => setCart((current) => current.filter((line) => line.bookId !== bookId)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((bookId: string) => setWishlist((current) => current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]), []);
  const isWishlisted = useCallback((bookId: string) => wishlist.includes(bookId), [wishlist]);
  const value = useMemo(() => ({ cart, wishlist, cartCount: cart.reduce((sum, line) => sum + line.quantity, 0), addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist, isWishlisted }), [cart, wishlist, addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist, isWishlisted]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
