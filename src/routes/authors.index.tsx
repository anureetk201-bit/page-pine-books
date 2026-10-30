import { createFileRoute, Link } from "@tanstack/react-router";
import { listAuthors, useCatalog } from "@/lib/catalog";
import { PageIntro } from "@/components/store/PageIntro";
export const Route = createFileRoute("/authors/")({
  head: () => ({
    meta: [
      { title: "Authors — Page & Pine" },
      { name: "description", content: "Meet the voices behind our favorite books." },
      { property: "og:title", content: "Authors — Page & Pine" },
      { property: "og:description", content: "Explore authors and their books." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const authors = listAuthors(useCatalog());
  return (
    <>
      <PageIntro eyebrow="The voices behind the pages" title="Authors" />
      <main className="page-container grid grid-cols-2 gap-px bg-border py-12 md:grid-cols-3 lg:grid-cols-4">
        {authors.map((a, i) => (
          <Link
            key={a.id}
            to="/authors/$id"
            params={{ id: a.id }}
            className="bg-background p-6 text-center transition hover:bg-secondary"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary font-display text-2xl text-primary-foreground">
              {a.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <h2 className="mt-4 font-display text-xl">{a.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {a.books} {a.books === 1 ? "book" : "books"}
            </p>
          </Link>
        ))}
      </main>
    </>
  );
}
