import type { Book } from "@/types/book";

/**
 * Scores the catalogue against the reader's own signals (past orders, wishlist,
 * and bag) so recommendations lean toward the categories and authors they love.
 */
export function recommendBooks(books: Book[], signalIds: string[], limit = 6): Book[] {
  const seen = new Set(signalIds);
  const liked = signalIds.map((id) => books.find((book) => book.id === id)).filter((book): book is Book => Boolean(book));

  const categoryWeight = new Map<string, number>();
  const authorWeight = new Map<string, number>();
  for (const book of liked) {
    categoryWeight.set(book.category, (categoryWeight.get(book.category) ?? 0) + 1);
    authorWeight.set(book.authorId, (authorWeight.get(book.authorId) ?? 0) + 1);
  }

  const scored = books
    .filter((book) => !seen.has(book.id) && book.available)
    .map((book) => {
      let score = book.rating * 0.6 + (book.bestseller ? 0.8 : 0) + (book.newArrival ? 0.4 : 0);
      score += (categoryWeight.get(book.category) ?? 0) * 2.5;
      score += (authorWeight.get(book.authorId) ?? 0) * 3.5;
      return { book, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.book);
}
