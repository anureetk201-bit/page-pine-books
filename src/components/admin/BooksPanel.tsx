import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddBookForm } from "@/components/store/AddBookForm";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { categories } from "@/data/books";
import { formatPrice } from "@/lib/currency";
import { PanelHeader, inputClass } from "./shared";

type BookRow = Database["public"]["Tables"]["books"]["Row"];

export function BooksPanel({ onChanged }: { onChanged: () => void }) {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<BookRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("books").select("*").order("title");
    if (error) setMessage(error.message);
    setBooks(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(book: BookRow, changes: Partial<BookRow>, note: string) {
    const { error } = await supabase.from("books").update(changes).eq("id", book.id);
    setMessage(error ? error.message : note);
    if (!error) {
      await load();
      onChanged();
    }
    return !error;
  }

  const needle = query.trim().toLowerCase();
  const visible = books.filter(
    (b) =>
      (category === "all" || b.category === category) &&
      (!needle ||
        b.title.toLowerCase().includes(needle) ||
        b.author.toLowerCase().includes(needle) ||
        b.isbn.includes(needle)),
  );

  return (
    <section>
      <PanelHeader
        title="Books"
        description={`${books.length} titles · ${books.filter((b) => !b.available).length} hidden from the store`}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, ISBN"
          aria-label="Search books"
          className={`${inputClass} w-60`}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={`${inputClass} w-40`}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button onClick={() => setAdding((v) => !v)} variant={adding ? "outline" : "default"}>
          <Plus /> {adding ? "Close" : "Add book"}
        </Button>
      </PanelHeader>
      {message && (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
      {adding && (
        <AddBookForm
          onAdded={() => {
            void load();
            onChanged();
          }}
        />
      )}

      <div className="mt-5 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Book</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Tags</th>
              <th className="px-5 py-3">Store</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((book) => (
              <tr key={book.id} className={book.available ? "" : "opacity-60"}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={book.cover_image}
                      alt=""
                      loading="lazy"
                      className="h-14 w-10 shrink-0 bg-secondary object-cover"
                    />
                    <div>
                      <span className="font-medium">{book.title}</span>
                      <span className="block text-xs text-muted-foreground">{book.author}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{book.category}</td>
                <td className="px-5 py-3">
                  {formatPrice(Number(book.price))}
                  {book.original_price && (
                    <span className="ml-1 text-xs text-muted-foreground line-through">
                      {formatPrice(Number(book.original_price))}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-[10px] font-bold uppercase text-muted-foreground">
                  {[book.bestseller && "Bestseller", book.new_arrival && "New"]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="px-5 py-3 text-xs">{book.available ? "Visible" : "Hidden"}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(book)}>
                      <Pencil /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={book.available ? `Hide ${book.title}` : `Show ${book.title}`}
                      onClick={() =>
                        void update(
                          book,
                          { available: !book.available },
                          `${book.title} is now ${book.available ? "hidden from" : "visible in"} the store.`,
                        )
                      }
                    >
                      {book.available ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No books match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">Edit book</DialogTitle>
            <DialogDescription>Changes show on the store straight away.</DialogDescription>
          </DialogHeader>
          {editing && (
            <EditBookForm
              book={editing}
              onSave={async (changes) => {
                if (await update(editing, changes, `${changes.title ?? editing.title} saved.`))
                  setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function EditBookForm({
  book,
  onSave,
}: {
  book: BookRow;
  onSave: (changes: Partial<BookRow>) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [cover, setCover] = useState(book.cover_image);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const original = get("original_price");
    setBusy(true);
    await onSave({
      title: get("title"),
      author: get("author"),
      price: Number(get("price")),
      original_price: original ? Number(original) : null,
      category: get("category"),
      cover_image: get("cover_image"),
      description: get("description"),
      publisher: get("publisher"),
      pages: Number(get("pages")),
      format: get("format"),
      low_stock_threshold: Number(get("low_stock_threshold")),
      bestseller: f.get("bestseller") === "on",
      new_arrival: f.get("new_arrival") === "on",
      available: f.get("available") === "on",
    });
    setBusy(false);
  }

  const label = "text-xs font-semibold";
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[120px_1fr]">
      <img
        src={cover}
        alt="Cover preview"
        className="aspect-[2/3] w-full bg-secondary object-cover"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Title
          <input name="title" defaultValue={book.title} required className={`mt-1 ${inputClass}`} />
        </label>
        <label className={label}>
          Author
          <input
            name="author"
            defaultValue={book.author}
            required
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={label}>
          Price (₹)
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={Number(book.price)}
            required
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={label}>
          Original price (₹)
          <input
            name="original_price"
            type="number"
            min="0"
            step="1"
            defaultValue={book.original_price ?? ""}
            placeholder="Leave empty if not on sale"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={label}>
          Category
          <select name="category" defaultValue={book.category} className={`mt-1 ${inputClass}`}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Format
          <select name="format" defaultValue={book.format} className={`mt-1 ${inputClass}`}>
            <option>Paperback</option>
            <option>Hardcover</option>
          </select>
        </label>
        <label className={label}>
          Publisher
          <input
            name="publisher"
            defaultValue={book.publisher}
            required
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={label}>
          Pages
          <input
            name="pages"
            type="number"
            min="1"
            defaultValue={book.pages}
            required
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Cover image URL
          <input
            name="cover_image"
            type="url"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            required
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={label}>
          Low-stock alert at
          <input
            name="low_stock_threshold"
            type="number"
            min="0"
            defaultValue={book.low_stock_threshold}
            className={`mt-1 ${inputClass}`}
          />
        </label>
      </div>
      <label className={`${label} sm:col-span-2`}>
        Description
        <textarea
          name="description"
          defaultValue={book.description}
          required
          rows={4}
          className="mt-1 w-full border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="flex flex-wrap gap-5 text-sm sm:col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="available" defaultChecked={book.available} /> Visible in
          store
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="bestseller" defaultChecked={book.bestseller} /> Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="new_arrival" defaultChecked={book.new_arrival} /> New arrival
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
