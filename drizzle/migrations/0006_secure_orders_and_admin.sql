-- The fixed admin ID login now creates the store admin, so nobody can self-claim the role any more.
DROP FUNCTION IF EXISTS public.claim_first_admin();

-- Orders are only created through place_order(), which prices them from the catalogue and checks stock.
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users create own order items" ON public.order_items;
REVOKE INSERT ON public.orders FROM authenticated;
REVOKE INSERT ON public.order_items FROM authenticated;

-- Keep in step with FREE_SHIPPING_THRESHOLD, SHIPPING_FEE and TAX_RATE in src/lib/currency.ts.
CREATE OR REPLACE FUNCTION public.place_order(p_items jsonb, p_shipping_address jsonb, p_payment_method text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  line record;
  subtotal numeric(10,2) := 0;
  shipping numeric(10,2);
  tax numeric(10,2);
  new_order_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Sign in to place an order.';
  END IF;
  IF p_payment_method NOT IN ('Card', 'UPI', 'PayPal') THEN
    RAISE EXCEPTION 'Choose a valid payment method.';
  END IF;
  IF jsonb_typeof(p_shipping_address) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'A shipping address is required.';
  END IF;
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  DROP TABLE IF EXISTS pg_temp.requested;
  CREATE TEMP TABLE requested ON COMMIT DROP AS
    SELECT item->>'book_id' AS book_id, sum((item->>'quantity')::integer) AS quantity
    FROM jsonb_array_elements(p_items) AS item
    GROUP BY item->>'book_id';

  IF EXISTS (SELECT 1 FROM requested WHERE book_id IS NULL OR quantity IS NULL OR quantity < 1 OR quantity > 99) THEN
    RAISE EXCEPTION 'Each book must have a quantity between 1 and 99.';
  END IF;

  IF EXISTS (SELECT 1 FROM requested r WHERE NOT EXISTS (SELECT 1 FROM public.books b WHERE b.id = r.book_id)) THEN
    RAISE EXCEPTION 'A book in your cart is no longer sold.';
  END IF;

  -- Lock the rows so two shoppers can't buy the same last copy.
  FOR line IN
    SELECT r.book_id, r.quantity, b.title, b.price, b.available, b.stock_quantity
    FROM requested r
    JOIN public.books b ON b.id = r.book_id
    ORDER BY r.book_id
    FOR UPDATE OF b
  LOOP
    IF NOT line.available OR line.stock_quantity < 1 THEN
      RAISE EXCEPTION '% is out of stock.', line.title;
    END IF;
    IF line.stock_quantity < line.quantity THEN
      RAISE EXCEPTION 'Only % copies of % are left.', line.stock_quantity, line.title;
    END IF;
    subtotal := subtotal + line.price * line.quantity;
  END LOOP;

  shipping := CASE WHEN subtotal >= 999 THEN 0 ELSE 49 END;
  tax := round(subtotal * 0.07, 2);

  INSERT INTO public.orders (user_id, status, total, shipping_address, payment_method)
  VALUES (uid, 'confirmed', subtotal + shipping + tax, p_shipping_address, p_payment_method)
  RETURNING id INTO new_order_id;

  -- The order_items trigger takes the copies out of stock.
  INSERT INTO public.order_items (order_id, book_id, title, unit_price, quantity)
  SELECT new_order_id, b.id, b.title, b.price, r.quantity
  FROM requested r JOIN public.books b ON b.id = r.book_id;

  RETURN new_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text) TO authenticated;

-- Selling the last copy hides a book, but never re-lists one the admin took off sale.
CREATE OR REPLACE FUNCTION public.decrement_book_stock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.books
  SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
      available = available AND (stock_quantity - NEW.quantity) > 0
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$;

-- Cancelling an order puts its copies back on the shelf; un-cancelling takes them out again.
CREATE OR REPLACE FUNCTION public.restock_cancelled_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    UPDATE public.books b
    SET stock_quantity = b.stock_quantity + oi.quantity,
        -- Re-list books that were hidden only because they sold out.
        available = b.available OR b.stock_quantity = 0
    FROM (SELECT book_id, sum(quantity) AS quantity FROM public.order_items WHERE order_id = NEW.id GROUP BY book_id) oi
    WHERE b.id = oi.book_id;
  ELSIF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
    UPDATE public.books b
    SET stock_quantity = GREATEST(b.stock_quantity - oi.quantity, 0),
        available = b.available AND (b.stock_quantity - oi.quantity) > 0
    FROM (SELECT book_id, sum(quantity) AS quantity FROM public.order_items WHERE order_id = NEW.id GROUP BY book_id) oi
    WHERE b.id = oi.book_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_restock_on_cancel
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.restock_cancelled_order();
