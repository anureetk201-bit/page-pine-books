import { BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return <Link to="/" aria-label="Page and Pine home" className={`flex items-center gap-2.5 ${inverted ? "text-primary-foreground" : "text-foreground"}`}>
    <BookOpen className="size-7 shrink-0 stroke-[1.25] sm:size-8" />
    <span className="leading-none"><strong className="block whitespace-nowrap font-display text-base tracking-[0.14em] sm:text-lg sm:tracking-[0.16em]">PAGE & PINE</strong><small className="mt-1 block text-[8px] font-bold tracking-[0.32em]">BOOKSHOP</small></span>
  </Link>;
}
