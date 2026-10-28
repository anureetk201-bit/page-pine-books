import { useCallback, useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { PanelHeader, formatDate, inputClass } from "./shared";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export function ReviewsPanel() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [rating, setRating] = useState("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [reviewResult, bookResult] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("books").select("id, title"),
    ]);
    if (reviewResult.error) setMessage(reviewResult.error.message);
    setReviews(reviewResult.data ?? []);
    setTitles(Object.fromEntries((bookResult.data ?? []).map((b) => [b.id, b.title])));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(review: ReviewRow) {
    if (
      !window.confirm(
        `Delete the review "${review.title}" by ${review.reviewer_name}? This can't be undone.`,
      )
    )
      return;
    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
    setMessage(error ? error.message : "Review deleted.");
    if (!error) setReviews((list) => list.filter((r) => r.id !== review.id));
  }

  const needle = query.trim().toLowerCase();
  const visible = reviews.filter(
    (r) =>
      (rating === "all" || r.rating === Number(rating)) &&
      (!needle ||
        [r.title, r.body, r.reviewer_name, titles[r.book_id] ?? ""].some((v) =>
          v.toLowerCase().includes(needle),
        )),
  );
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section>
      <PanelHeader
        title="Reviews"
        description={`${reviews.length} reviews · average ${average.toFixed(1)} stars`}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reviews"
          aria-label="Search reviews"
          className={`${inputClass} w-60`}
        />
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          aria-label="Filter by rating"
          className={`${inputClass} w-36`}
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </PanelHeader>
      {message && (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
      <div className="mt-5 space-y-3">
        {visible.length === 0 && (
          <p className="border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No reviews match.
          </p>
        )}
        {visible.map((r) => (
          <article key={r.id} className="flex gap-4 border border-border bg-card px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex text-accent" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-3 ${n <= r.rating ? "fill-current" : "opacity-30"}`}
                    />
                  ))}
                </span>
                <strong className="text-sm">{r.title}</strong>
              </div>
              <p className="mt-2 text-sm leading-6">{r.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {r.reviewer_name} on <em>{titles[r.book_id] ?? r.book_id}</em> ·{" "}
                {formatDate(r.created_at)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Delete review by ${r.reviewer_name}`}
              onClick={() => void remove(r)}
            >
              <Trash2 />
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
