import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Headphones, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "./Brand";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { languages } from "@/data/languages";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/currency";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  ["HOME", "/"], ["BOOKS", "/books"], ["DISCOVER", "/discover"], ["CATEGORIES", "/categories"], ["BESTSELLERS", "/bestsellers"],
  ["NEW ARRIVALS", "/new-arrivals"], ["AUTHORS", "/authors"], ["ABOUT US", "/about"],
] as const;

export function Header() {
  const { cartCount } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("page-pine-language") ?? "en";
    setLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
  }, []);
  function changeLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem("page-pine-language", value);
    document.documentElement.lang = value;
    setLanguageOpen(false);
  }
  function submitSearch(event: React.FormEvent) { event.preventDefault(); if (query.trim()) { navigate({ to: "/search", search: { q: query.trim() } }); setSearchOpen(false); } }
  return <>
    <div className="bg-primary text-primary-foreground">
      <div className="page-container grid h-8 grid-cols-[1fr_auto] items-center text-[10px] sm:grid-cols-3">
        <span className="flex items-center gap-2"><ShoppingBag className="size-3.5" /> {`Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}</span>
        <span className="hidden text-center sm:block">✦ &nbsp; Books that inspire, stories that stay.</span>
        <span className="hidden items-center justify-end gap-1 sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-7 gap-1.5 px-2 text-[10px] text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Headphones className="size-3.5" /> Customer Support <ChevronDown className="size-3" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem asChild><Link to="/support">Help center</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/orders">Track an order</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/account">Account help</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
            <PopoverTrigger asChild><Button variant="ghost" className="h-7 gap-1 px-2 text-[10px] uppercase text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label="Select language">{language}<ChevronDown className="size-3" /></Button></PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Search languages…" aria-label="Search languages" />
                <CommandList className="max-h-72">
                  <CommandEmpty>No language found.</CommandEmpty>
                  {languages.map(({ code, name }) => (
                    <CommandItem key={code} value={`${name} ${code}`} onSelect={() => changeLanguage(code)}>
                      <Check className={language === code ? "opacity-100" : "opacity-0"} />
                      <span className="flex-1">{name}</span><span className="text-xs uppercase text-muted-foreground">{code}</span>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </span>
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
