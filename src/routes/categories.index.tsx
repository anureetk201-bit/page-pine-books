import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { categories, categoryCopy, categoryImages } from "@/data/books";
import { PageIntro } from "@/components/store/PageIntro";
export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Book Categories — Page & Pine" },
      { name: "description", content: "Find your next read by category." },
      { property: "og:title", content: "Book Categories — Page & Pine" },
      { property: "og:description", content: "Browse every Page & Pine category." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <>
      <PageIntro eyebrow="Browse by category" title="Find Your Next Read" />
      <main className="page-container grid grid-cols-2 gap-4 py-10 md:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c}
            to="/categories/$slug"
            params={{ slug: c.toLowerCase().replaceAll(" ", "-") }}
            className="group relative aspect-[1.15] overflow-hidden rounded-md"
          >
            <img
              src={categoryImages[c]}
              alt={`${c} collection`}
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/55" />
            <div className="absolute inset-0 grid place-content-center text-center text-primary-foreground">
              <BookOpen className="mx-auto mb-3" />
              <h2 className="font-display text-2xl">{c}</h2>
              <p className="text-xs">{categoryCopy[c]}</p>
            </div>
          </Link>
        ))}
      </main>
    </>
  );
}
