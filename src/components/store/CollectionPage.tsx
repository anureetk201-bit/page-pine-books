import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Book } from "@/types/book";
import { categories } from "@/data/books";
import { useCatalog } from "@/lib/catalog";
import { BookGrid } from "./BookCard";
import { PageIntro } from "./PageIntro";
import { Button } from "@/components/ui/button";

export function CollectionPage({ title, eyebrow, filter, copy, showFilters = true }: { title: string; eyebrow: string; filter?: (book: Book) => boolean; copy?: string | undefined; showFilters?: boolean }) {
 const catalog=useCatalog(); const source=useMemo(()=>filter?catalog.filter(filter):catalog,[catalog,filter]);
 const [query,setQuery]=useState(""); const [category,setCategory]=useState("All"); const [sort,setSort]=useState("featured"); const [limit,setLimit]=useState(12);
 const result=useMemo(()=>{ const list=source.filter((b)=>(category==="All"||b.category===category)&&`${b.title} ${b.author}`.toLowerCase().includes(query.toLowerCase())); return [...list].sort((a,b)=>sort==="low"?a.price-b.price:sort==="high"?b.price-a.price:sort==="rating"?b.rating-a.rating:sort==="new"?Date.parse(b.publicationDate)-Date.parse(a.publicationDate):Number(b.bestseller)-Number(a.bestseller)); },[source,query,category,sort]);
 return <><PageIntro eyebrow={eyebrow} title={title} copy={copy}/><main className="page-container py-10">{showFilters&&<div className="mb-8 grid gap-3 border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto]">
  <label className="relative"><span className="sr-only">Search this collection</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search title or author" className="h-11 w-full border border-input bg-background pl-10 pr-3 outline-none focus:ring-2 focus:ring-ring"/></label>
  <label><span className="sr-only">Filter category</span><select value={category} onChange={(e)=>setCategory(e.target.value)} className="h-11 w-full border border-input bg-background px-3 text-sm md:w-44"><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
  <label><span className="sr-only">Sort books</span><select value={sort} onChange={(e)=>setSort(e.target.value)} className="h-11 w-full border border-input bg-background px-3 text-sm md:w-48"><option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="rating">Rating</option></select></label>
 </div>}<BookGrid books={result.slice(0,limit)}/>{limit<result.length&&<div className="mt-9 text-center"><Button variant="outline" size="lg" onClick={()=>setLimit(v=>v+8)}>Load more books</Button></div>}</main></>;
}
