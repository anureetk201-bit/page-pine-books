// Single place that decides how money is written across the storefront.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Renders a rupee amount the Indian way: 1199 → ₹1,199 · 125000 → ₹1,25,000 */
export function formatPrice(value: number) {
  return inr.format(Math.round(Number.isFinite(value) ? value : 0));
}

// The place_order database function charges these same amounts; change both together.

/** Rupee value at which an order ships free. */
export const FREE_SHIPPING_THRESHOLD = 999;

/** Flat shipping charge for orders below the free-shipping threshold. */
export const SHIPPING_FEE = 49;

/** Estimated tax applied to the order subtotal. */
export const TAX_RATE = 0.07;
