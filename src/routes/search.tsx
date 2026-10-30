import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useCatalog } from "@/lib/catalog";
import { BookGrid } from "@/components/store/BookCard";
import { PageIntro } from "@/components/store/PageIntro";
export const Route = createFileRoute("/search")({
  validateSearch: (s) => z.object({ q: z.string().catch("") }).parse(s),
  head: () => ({
    meta: [
      { title: "Search Books — Page & Pine" },
      { name: "description", content: "Search the Page & Pine catalog." },
      { property: "og:title", content: "Search Books — Page & Pine" },
      { property: "og:description", content: "Find books by title, author, category, or subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const { q } = Route.useSearch();
  const terms = q.toLowerCase();
  const found = useCatalog().filter((b) =>
    `${b.title} ${b.author} ${b.category} ${b.description}`.toLowerCase().includes(terms),
  );
  return (
    <>
      <PageIntro
        eyebrow="Catalog search"
        title={q ? `Search results for: “${q}”` : "Search Results"}
      />
      <main className="page-container py-10">
        <BookGrid books={found} />
      </main>
    </>
  );
}
