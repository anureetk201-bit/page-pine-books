import { useQuery } from "@tanstack/react-query";
import { books as staticBooks, categories } from "@/data/books";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Book, Category } from "@/types/book";

type BookRow = Database["public"]["Tables"]["books"]["Row"];

const staticOrder = new Map(staticBooks.map((book, index) => [book.id, index]));

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    authorId: row.author_id,
    price: Number(row.price),
    ...(row.original_price ? { originalPrice: Number(row.original_price) } : {}),
    category: (categories as string[]).includes(row.category)
      ? (row.category as Category)
      : "Fiction",
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    coverImage: row.cover_image,
    description: row.description,
    isbn: row.isbn,
    publisher: row.publisher,
    publicationDate: row.publication_date,
    pages: row.pages,
    format: row.format === "Hardcover" ? "Hardcover" : "Paperback",
    bestseller: row.bestseller,
    newArrival: row.new_arrival,
    available: row.available && row.stock_quantity > 0,
  };
}

/**
 * Loads the live catalogue (including books added from the store dashboard and
 * current stock). Falls back to the bundled catalogue if the database is unreachable.
 */
export async function fetchCatalog(): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .abortSignal(AbortSignal.timeout(8000));
    if (error || !data?.length) return staticBooks;
    return data
      .map(rowToBook)
      .sort(
        (a, b) =>
          (staticOrder.get(a.id) ?? Infinity) - (staticOrder.get(b.id) ?? Infinity) ||
          b.publicationDate.localeCompare(a.publicationDate),
      );
  } catch {
    return staticBooks;
  }
}

export const catalogQuery = {
  queryKey: ["catalog"],
  queryFn: fetchCatalog,
  staleTime: 60_000,
} as const;

/** The storefront catalogue. Renders the bundled books immediately, then swaps in live data. */
export function useCatalog(): Book[] {
  const { data } = useQuery({ ...catalogQuery, placeholderData: staticBooks });
  return data ?? staticBooks;
}

/** Finds a book for a route loader: bundled books resolve instantly, newer ones come from the database. */
export async function loadBook(id: string): Promise<Book | undefined> {
  return (
    staticBooks.find((book) => book.id === id) ??
    (await fetchCatalog()).find((book) => book.id === id)
  );
}

export function listAuthors(list: Book[]) {
  return Array.from(
    new Map(
      list.map((book) => [
        book.authorId,
        {
          id: book.authorId,
          name: book.author,
          books: list.filter((item) => item.authorId === book.authorId).length,
        },
      ]),
    ).values(),
  );
}
