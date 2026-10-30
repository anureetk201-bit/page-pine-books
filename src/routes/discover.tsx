import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { BookCard } from "@/components/store/BookCard";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/catalog";
import { discoverBooks, type DiscoveryResult } from "@/lib/discovery.functions";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Smart book discovery — Page & Pine" },
      {
        name: "description",
        content:
          "Describe the mood, theme, or moment you are in and let Page & Pine shortlist the right books for you.",
      },
      { property: "og:title", content: "Smart book discovery — Page & Pine" },
      {
        property: "og:description",
        content: "Tell us how you want to feel and we will find the book.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverPage,
});

const prompts = [
  "Something hopeful to read after a hard week",
  "A slow, atmospheric mystery for rainy evenings",
  "Non-fiction that will change how I think about time",
  "A romance with real emotional depth",
];

function DiscoverPage() {
  const runDiscovery = useServerFn(discoverBooks);
  const catalog = useCatalog();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);

  async function ask(text: string) {
    if (text.trim().length < 2) return;
    setBusy(true);
    setResult(null);
    try {
      setResult(await runDiscovery({ data: { query: text.trim() } }));
    } catch {
      setResult({ summary: "", picks: [], error: "Smart discovery could not answer just now." });
    }
    setBusy(false);
  }

  return (
    <main>
      <section className="bg-secondary">
        <div className="page-container py-16 text-center">
          <p className="eyebrow flex items-center justify-center gap-2">
            <Sparkles className="size-4" /> Smart discovery
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl leading-none sm:text-6xl">
            Tell us what you’re in the mood for.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Describe a feeling, a theme, or the kind of evening you want — our bookseller will
            shortlist titles from the shelves.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(query);
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A comforting novel about starting over…"
              aria-label="Describe what you want to read"
              className="h-12 w-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Thinking…" : "Find my books"}
            </Button>
          </form>
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  void ask(prompt);
                }}
                className="border border-border bg-card px-3 py-2 text-[11px] hover:bg-secondary"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        {busy && <p className="text-sm text-muted-foreground">Reading the shelves for you…</p>}
        {result?.error && (
          <p className="border border-destructive/30 bg-destructive/5 p-5 text-sm" role="status">
            {result.error}
          </p>
        )}
        {result && !result.error && (
          <>
            {result.summary && (
              <p className="mx-auto max-w-2xl text-center font-display text-2xl leading-8">
                {result.summary}
              </p>
            )}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.picks.map((pick) => {
                const book = catalog.find((b) => b.id === pick.id);
                if (!book) return null;
                return (
                  <div key={pick.id} className="space-y-3">
                    <BookCard book={book} />
                    <p className="text-xs leading-5 text-muted-foreground">{pick.reason}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
