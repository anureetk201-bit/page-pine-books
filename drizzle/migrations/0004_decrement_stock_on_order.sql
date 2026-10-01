CREATE OR REPLACE FUNCTION public.decrement_book_stock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.books
  SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
      available = (stock_quantity - NEW.quantity) > 0
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER order_items_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_book_stock();