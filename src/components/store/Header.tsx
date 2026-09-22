import { Link, useNavigate } from "@tanstack/react-router";
import { Headphones, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const links = [
  ["HOME", "/"], ["BOOKS", "/books"], ["CATEGORIES", "/categories"], ["BESTSELLERS", "/bestsellers"],
  ["NEW ARRIVALS", "/new-arrivals"], ["AUTHORS", "/authors"], ["ABOUT US", "/about"],
] as const;

export function Header() {
  const { cartCount } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  function submitSearch(event: React.FormEvent) { event.preventDefault(); if (query.trim()) { navigate({ to: "/search", search: { q: query.trim() } }); setSearchOpen(false); } }
  return <>
    <div className="bg-primary text-primary-foreground">
      <div className="page-container grid h-8 grid-cols-[1fr_auto] items-center text-[10px] sm:grid-cols-3">
        <span className="flex items-center gap-2"><ShoppingBag className="size-3.5" /> Free shipping on orders over $50</span>
        <span className="hidden text-center sm:block">✦ &nbsp; Books that inspire, stories that stay.</span>
        <span className="hidden items-center justify-end gap-4 sm:flex"><span className="flex items-center gap-1.5"><Headphones className="size-3.5" /> Customer Support</span><span>EN⌄</span></span>
      </div>
    </div>
    <header className="relative z-50 border-b border-border bg-background">
      <div className="page-container grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid-cols-[auto_1fr_auto]">
        <Brand />
        <nav className="hidden items-center justify-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map(([label, to]) => <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="nav-link" activeProps={{ className: "nav-link nav-link-active" }}>{label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}><Search /></Button>
          <Button asChild variant="ghost" size="icon"><Link to="/account" aria-label={user ? `Account for ${user.email ?? "reader"}` : "Sign in"}><UserRound className={user ? "fill-primary/15" : undefined} /></Link></Button>
          <Button asChild variant="ghost" size="icon"><Link to="/wishlist" aria-label="Wishlist"><span className="text-base">♡</span></Link></Button>
          <Button asChild variant="ghost" size="icon" className="relative"><Link to="/cart" aria-label={`Cart with ${cartCount} items`}><ShoppingBag />{cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">{cartCount}</span>}</Link></Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {open && <nav className="border-t border-border bg-background px-5 py-4 lg:hidden" aria-label="Mobile navigation">{links.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="block border-b border-border/60 py-3 text-xs font-bold tracking-wider">{label}</Link>)}</nav>}
    </header>
    {searchOpen && <div className="fixed inset-0 z-[60] bg-foreground/40 p-4 pt-28 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search books" onMouseDown={() => setSearchOpen(false)}>
      <form onSubmit={submitSearch} onMouseDown={(e) => e.stopPropagation()} className="mx-auto flex max-w-2xl gap-2 rounded-lg bg-background p-3 shadow-2xl">
        <label htmlFor="site-search" className="sr-only">Search books</label><input id="site-search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author, or category…" className="h-12 min-w-0 flex-1 bg-transparent px-3 outline-none" />
        <Button type="submit" size="lg">Search</Button><Button type="button" size="icon" variant="ghost" aria-label="Close search" onClick={() => setSearchOpen(false)}><X /></Button>
      </form>
    </div>}
  </>;
}
