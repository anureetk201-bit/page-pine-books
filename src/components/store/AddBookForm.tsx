import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/books";

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const input = "mt-1 h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function AddBookForm({ onAdded }: { onAdded?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const isbn = get("isbn").replace(/[^0-9X]/gi, "");
    const title = get("title");
    const author = get("author");
    setBusy(true); setMessage("");
    const { error } = await supabase.from("books").insert({
      id: slug(title),
      title, author, author_id: slug(author), isbn,
      price: Number(get("price")),
      category: get("category"),
      cover_image: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      description: get("description"),
      publisher: get("publisher"),
      publication_date: get("date"),
      pages: Number(get("pages")),
      format: "Paperback",
      stock_quantity: Number(get("stock")),
      new_arrival: true,
    });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setMessage(`${title} added to the catalogue.`);
    formEl.reset();
    onAdded?.();
  }

  return (
    <section className="mt-12 border border-border bg-card p-6">
      <h2 className="font-display text-3xl">Add a book</h2>
      <p className="mt-1 text-xs text-muted-foreground">The cover is fetched automatically from the ISBN.</p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-semibold">Title<input name="title" required className={input} /></label>
        <label className="text-xs font-semibold">Author<input name="author" required className={input} /></label>
        <label className="text-xs font-semibold">ISBN-13<input name="isbn" required pattern="[0-9Xx-]{10,17}" className={input} /></label>
        <label className="text-xs font-semibold">Price (USD)<input name="price" type="number" step="0.01" min="0" required className={input} /></label>
        <label className="text-xs font-semibold">Category
          <select name="category" required className={input}>{categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
        </label>
        <label className="text-xs font-semibold">Stock<input name="stock" type="number" min="0" defaultValue={24} required className={input} /></label>
        <label className="text-xs font-semibold">Publisher<input name="publisher" required className={input} /></label>
        <label className="text-xs font-semibold">Publication date<input name="date" type="date" required className={input} /></label>
        <label className="text-xs font-semibold">Pages<input name="pages" type="number" min="1" required className={input} /></label>
        <label className="text-xs font-semibold sm:col-span-2 lg:col-span-3">Description<textarea name="description" required rows={3} className="mt-1 w-full border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
        <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
          <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add book"}</Button>
          {message && <p className="text-xs text-muted-foreground" role="status">{message}</p>}
        </div>
      </form>
    </section>
  );
}
