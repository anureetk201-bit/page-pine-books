import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReviewRow {
  id: string; user_id: string; reviewer_name: string; rating: number; title: string; body: string; created_at: string;
}

export function BookReviews({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, user_id, reviewer_name, rating, title, body, created_at")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as ReviewRow[]);
  }, [bookId]);

  useEffect(() => { void load(); }, [load]);

  const mine = reviews.find((review) => review.user_id === user?.id);
  useEffect(() => {
    if (!mine) return;
    setRating(mine.rating); setTitle(mine.title); setBody(mine.body);
  }, [mine]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true); setMessage("");
    const name = String(user.user_metadata["full_name"] ?? user.email?.split("@")[0] ?? "Reader");
    const { error } = await supabase
      .from("reviews")
      .upsert({ book_id: bookId, user_id: user.id, reviewer_name: name, rating, title, body }, { onConflict: "book_id,user_id" });
    setMessage(error ? error.message : mine ? "Review updated." : "Thanks for your review.");
    if (!error) await load();
    setBusy(false);
  }

  return (
    <section className="border-t border-border py-14" aria-labelledby="reviews-heading">
      <p className="eyebrow">Reader reviews</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-heading" className="section-heading">What readers say</h2>
        {reviews.length > 0 && (
          <p className="text-sm text-muted-foreground">
            <strong className="font-display text-2xl text-foreground">{average.toFixed(1)}</strong> / 5 from {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your thoughts.</p>}
          {reviews.map((review) => (
            <article key={review.id} className="border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm">{review.reviewer_name}</strong>
                <Stars value={review.rating} />
              </div>
              {review.title && <p className="mt-2 font-display text-lg">{review.title}</p>}
              {review.body && <p className="mt-1 text-sm leading-6 text-muted-foreground">{review.body}</p>}
              <p className="mt-3 text-[10px] uppercase text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
            </article>
          ))}
        </div>

        <div className="border border-border bg-card p-6">
          <h3 className="font-display text-2xl">{mine ? "Edit your review" : "Write a review"}</h3>
          {!user && (
            <>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to share your thoughts with other readers.</p>
              <Button asChild className="mt-4"><Link to="/account">Sign in</Link></Button>
            </>
          )}
          {user && (
            <form className="mt-4 space-y-4" onSubmit={submit}>
              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold">Your rating</legend>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" aria-label={`${value} star${value === 1 ? "" : "s"}`} onClick={() => setRating(value)}>
                      <Star className={`size-6 ${value <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold">Headline</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className="h-11 w-full border border-input bg-background px-3" />
              </label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold">Your review</span>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={900} className="w-full border border-input bg-background p-3 text-sm" />
              </label>
              <Button disabled={busy} type="submit">{busy ? "Saving…" : mine ? "Update review" : "Post review"}</Button>
              {message && <p className="text-xs text-muted-foreground" role="status">{message}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return <span className="flex text-accent" aria-label={`${value} out of 5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-3.5 ${n <= value ? "fill-current" : "opacity-30"}`} />)}</span>;
}
