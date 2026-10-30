import { Sparkles } from "lucide-react";
import { BookCard } from "./BookCard";
import { useRecommendations } from "@/hooks/useRecommendations";

export function RecommendedForYou({
  limit = 6,
  className = "page-container pb-14",
}: {
  limit?: number;
  className?: string;
}) {
  const { books: picks, personalized } = useRecommendations(limit);
  if (picks.length === 0) return null;
  return (
    <section className={className} aria-labelledby="recommended-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Sparkles className="size-3.5" />{" "}
            {personalized ? "Picked for you" : "Reader favourites"}
          </p>
          <h2 id="recommended-heading" className="section-heading mt-1">
            {personalized ? "Because of what you’ve been reading" : "A good place to start"}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {picks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
