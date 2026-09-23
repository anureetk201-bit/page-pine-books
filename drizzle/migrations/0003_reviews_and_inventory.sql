-- Customer reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reviewer_name text NOT NULL DEFAULT 'Reader',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, user_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users write own reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins delete any review" ON public.reviews
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX reviews_book_id_idx ON public.reviews (book_id, created_at DESC);

-- Inventory management
ALTER TABLE public.books ADD COLUMN stock_quantity integer NOT NULL DEFAULT 24;
ALTER TABLE public.books ADD COLUMN low_stock_threshold integer NOT NULL DEFAULT 5;