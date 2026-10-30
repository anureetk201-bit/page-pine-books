import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

/** The most copies of one book a cart line can hold (the cart_items table enforces the same cap). */
export const MAX_CART_QUANTITY = 99;
const clampQuantity = (quantity: number) => Math.min(MAX_CART_QUANTITY, Math.round(quantity));

const CART_KEY = "page-pine-cart";
const WISHLIST_KEY = "page-pine-wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  // Whose cart is loaded: undefined until hydrated, null for a guest, otherwise the user id.
  const [owner, setOwner] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCart(readStorage<CartLine[]>(CART_KEY, []));
      setWishlist(readStorage<string[]>(WISHLIST_KEY, []));
      setOwner(null);
      return;
    }
    let active = true;
    void Promise.all([
      supabase.from("cart_items").select("book_id, quantity").eq("user_id", user.id),
      supabase.from("wishlist_items").select("book_id").eq("user_id", user.id),
    ]).then(([cartResult, wishlistResult]) => {
      if (!active) return;
      const savedCart = (cartResult.data ?? []).map((row) => ({
        bookId: row.book_id,
        quantity: row.quantity,
      }));
      const savedWishlist = (wishlistResult.data ?? []).map((row) => row.book_id);

      // Fold anything picked while signed out into the account, then forget the guest copy.
      const guestCart = readStorage<CartLine[]>(CART_KEY, []);
      const guestWishlist = readStorage<string[]>(WISHLIST_KEY, []);
      const mergedCart = [...savedCart];
      for (const line of guestCart) {
        const found = mergedCart.find((saved) => saved.bookId === line.bookId);
        if (found) found.quantity = clampQuantity(found.quantity + line.quantity);
        else mergedCart.push({ bookId: line.bookId, quantity: clampQuantity(line.quantity) });
      }
      const newWishlist = guestWishlist.filter((id) => !savedWishlist.includes(id));
      if (guestCart.length)
        void supabase
          .from("cart_items")
          .upsert(
            mergedCart
              .filter((line) => guestCart.some((guest) => guest.bookId === line.bookId))
              .map((line) => ({ user_id: user.id, book_id: line.bookId, quantity: line.quantity })),
          );
      if (newWishlist.length)
        void supabase.from("wishlist_items").upsert(
          newWishlist.map((id) => ({ user_id: user.id, book_id: id })),
          { ignoreDuplicates: true },
        );
      try {
        window.localStorage.removeItem(CART_KEY);
        window.localStorage.removeItem(WISHLIST_KEY);
      } catch {
        /* storage unavailable */
      }

      setCart(mergedCart);
      setWishlist([...savedWishlist, ...newWishlist]);
      setOwner(user.id);
    });
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  // Only a guest's own cart is kept in the browser, never an account cart left over after sign-out.
  const isGuestCart = owner === null && !user;
  useEffect(() => {
    if (!isGuestCart) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, isGuestCart]);
  useEffect(() => {
    if (!isGuestCart) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, isGuestCart]);

  const addToCart = useCallback(
    (bookId: string, quantity = 1) =>
      setCart((current) => {
        const found = current.find((line) => line.bookId === bookId);
        const nextQuantity = clampQuantity((found?.quantity ?? 0) + quantity);
        if (nextQuantity < 1) return current;
        if (user)
          void supabase
            .from("cart_items")
            .upsert({ user_id: user.id, book_id: bookId, quantity: nextQuantity });
        return found
          ? current.map((line) =>
              line.bookId === bookId ? { ...line, quantity: nextQuantity } : line,
            )
          : [...current, { bookId, quantity: nextQuantity }];
      }),
    [user],
  );
  const updateQuantity = useCallback(
    (bookId: string, requested: number) =>
      setCart((current) => {
        const quantity = clampQuantity(requested);
        if (user)
          void (quantity < 1
            ? supabase.from("cart_items").delete().eq("user_id", user.id).eq("book_id", bookId)
            : supabase
                .from("cart_items")
                .update({ quantity })
                .eq("user_id", user.id)
                .eq("book_id", bookId));
        return quantity < 1
          ? current.filter((line) => line.bookId !== bookId)
          : current.map((line) => (line.bookId === bookId ? { ...line, quantity } : line));
      }),
    [user],
  );
  const removeFromCart = useCallback(
    (bookId: string) =>
      setCart((current) => {
        if (user)
          void supabase.from("cart_items").delete().eq("user_id", user.id).eq("book_id", bookId);
        return current.filter((line) => line.bookId !== bookId);
      }),
    [user],
  );
  const clearCart = useCallback(() => {
    if (user) void supabase.from("cart_items").delete().eq("user_id", user.id);
    setCart([]);
  }, [user]);
  const toggleWishlist = useCallback(
    (bookId: string) =>
      setWishlist((current) => {
        const exists = current.includes(bookId);
        if (user)
          void (exists
            ? supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("book_id", bookId)
            : supabase.from("wishlist_items").insert({ user_id: user.id, book_id: bookId }));
        return exists ? current.filter((id) => id !== bookId) : [...current, bookId];
      }),
    [user],
  );
  const isWishlisted = useCallback((bookId: string) => wishlist.includes(bookId), [wishlist]);
  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
    }),
    [
      cart,
      wishlist,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
    ],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
