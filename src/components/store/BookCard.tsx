import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Book } from "@/types/book";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";

export function Rating({ rating, count, compact = false }: { rating: number; count?: number; compact?: boolean }) {
  return <div className="flex items-center gap-1 text-[10px]"><span className="flex text-accent">{[1,2,3,4,5].map((n) => <Star key={n} className={`${compact ? "size-2.5" : "size-3"} fill-current`} />)}</span><span className="text-muted-foreground">{rating.toFixed(1)}{count ? ` (${count.toLocaleString()})` : ""}</span></div>;
}

export function BookCard({ book }: { book: Book }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore(); const wished = isWishlisted(book.id);
  return <article className="group relative flex min-w-0 flex-col border border-border/70 bg-card transition duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="relative overflow-hidden bg-secondary p-3 sm:p-4">
      <Link to="/books/$id" params={{ id: book.id }} aria-label={`View ${book.title}`}><img src={book.coverImage} alt={`${book.title} by ${book.author} cover`} loading="lazy" width={320} height={480} className="aspect-[2/3] w-full object-contain transition duration-500 group-hover:scale-[1.035]" /></Link>
      <Button variant="paper" size="icon" aria-label={wished ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`} onClick={() => toggleWishlist(book.id)} className="absolute right-2 top-2 size-8 opacity-0 shadow-md transition group-hover:opacity-100 focus:opacity-100"><Heart className={wished ? "fill-current text-destructive" : ""} /></Button>
      {book.originalPrice && <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-1 text-[9px] font-bold text-primary-foreground">SALE</span>}
    </div>
    <div className="flex flex-1 flex-col p-3"><Link to="/books/$id" params={{ id: book.id }} className="line-clamp-2 min-h-10 font-display text-base font-semibold leading-5 hover:text-primary">{book.title}</Link><p className="mt-1 truncate text-[11px] text-muted-foreground">{book.author}</p><div className="mt-2"><Rating rating={book.rating} count={book.reviewCount} compact /></div><div className="mt-auto flex items-end justify-between gap-2 pt-3"><div><span className="font-bold">{formatPrice(book.price)}</span>{book.originalPrice && <span className="ml-1 text-[10px] text-muted-foreground line-through">{formatPrice(book.originalPrice)}</span>}</div><Button size="icon" variant="ghost" disabled={!book.available} aria-label={book.available ? `Add ${book.title} to cart` : `${book.title} is out of stock`} onClick={() => addToCart(book.id)} className="size-8 border border-border group-hover:bg-primary group-hover:text-primary-foreground"><ShoppingBag /></Button></div></div>
  </article>;
}

export function BookGrid({ books }: { books: Book[] }) { return books.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{books.map((book) => <BookCard key={book.id} book={book} />)}</div> : <div className="border border-dashed border-border py-20 text-center"><h2 className="font-display text-3xl">No books found.</h2><p className="mt-2 text-sm text-muted-foreground">Try a different title, author, or category.</p></div>; }
