import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchCatalog } from "@/lib/catalog";
import type { Book } from "@/types/book";

const DiscoverInput = z.object({ query: z.string().min(2).max(400) });

export interface DiscoveryPick {
  id: string;
  reason: string;
}

export interface DiscoveryResult {
  summary: string;
  picks: DiscoveryPick[];
  error?: string;
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "picks"],
  properties: {
    summary: { type: "string", description: "One friendly sentence describing the shortlist." },
    picks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "reason"],
        properties: {
          id: { type: "string", description: "The catalogue id of the book." },
          reason: { type: "string", description: "One sentence on why it fits the request." },
        },
      },
    },
  },
} as const;

export const discoverBooks = createServerFn({ method: "POST" })
  .validator((input: unknown) => DiscoverInput.parse(input))
  .handler(async ({ data }): Promise<DiscoveryResult> => {
    const books = await fetchCatalog();
    const key = process.env["LOVABLE_API_KEY"];
    // The AI bookseller is optional: without a key, or if it fails, match the request against the catalogue directly.
    const answer = key ? await askBookseller(books, data.query, key).catch(() => null) : null;
    return answer && answer.picks.length > 0 ? answer : keywordDiscovery(books, data.query);
  });

async function askBookseller(
  books: Book[],
  query: string,
  key: string,
): Promise<DiscoveryResult | null> {
  const catalogue = books
    .map(
      (book) =>
        `${book.id} | ${book.title} by ${book.author} | ${book.category} | ${book.description}`,
    )
    .join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      instructions:
        "You are a warm, well-read bookseller at Page & Pine. Choose 3 to 5 books from the catalogue that best match the reader's request. Only ever use ids from the catalogue. Keep each reason to one inviting sentence.",
      input: `Reader's request: ${query}\n\nCatalogue (id | title by author | category | description):\n${catalogue}`,
      text: {
        format: { type: "json_schema", name: "shortlist", strict: true, schema: responseSchema },
      },
    }),
  });

  if (!response.ok || !response.body) return null;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as { type?: string; delta?: string };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string")
          text += event.delta;
      } catch {
        // ignore malformed keep-alive chunks
      }
    }
  }

  try {
    const parsed = JSON.parse(text) as DiscoveryResult;
    const valid = new Set(books.map((book) => book.id));
    return {
      summary: parsed.summary ?? "",
      picks: (parsed.picks ?? []).filter((pick) => valid.has(pick.id)).slice(0, 5),
    };
  } catch {
    return null;
  }
}

// Words a reader might use, mapped to the shelves they usually mean.
const MOOD_CATEGORIES: Record<string, Book["category"]> = {
  love: "Romance",
  romance: "Romance",
  romantic: "Romance",
  relationship: "Romance",
  heart: "Romance",
  kid: "Children",
  kids: "Children",
  child: "Children",
  children: "Children",
  young: "Children",
  bedtime: "Children",
  classic: "Classics",
  classics: "Classics",
  timeless: "Classics",
  habit: "Self-Help",
  habits: "Self-Help",
  productivity: "Self-Help",
  time: "Self-Help",
  calm: "Self-Help",
  mindful: "Self-Help",
  motivation: "Self-Help",
  growth: "Self-Help",
  history: "Non-Fiction",
  memoir: "Non-Fiction",
  true: "Non-Fiction",
  science: "Non-Fiction",
  think: "Non-Fiction",
  thinking: "Non-Fiction",
  "non-fiction": "Non-Fiction",
  nonfiction: "Non-Fiction",
  novel: "Fiction",
  story: "Fiction",
  mystery: "Fiction",
  atmospheric: "Fiction",
  fiction: "Fiction",
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "for",
  "in",
  "on",
  "with",
  "about",
  "after",
  "that",
  "will",
  "how",
  "i",
  "me",
  "my",
  "something",
  "some",
  "book",
  "books",
  "read",
  "want",
  "like",
]);

function keywordDiscovery(books: Book[], query: string): DiscoveryResult {
  const words = query
    .toLowerCase()
    .split(/[^a-z-]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  const wantedCategories = new Set(words.map((word) => MOOD_CATEGORIES[word]).filter(Boolean));
  const picks = books
    .filter((book) => book.available)
    .map((book) => {
      const haystack =
        `${book.title} ${book.author} ${book.category} ${book.description}`.toLowerCase();
      const hits = words.filter((word) => haystack.includes(word.replace(/s$/, "")));
      const score =
        hits.length * 2 +
        (wantedCategories.has(book.category) ? 3 : 0) +
        book.rating * 0.2 +
        (book.bestseller ? 0.3 : 0);
      return { book, hits, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ book, hits }) => ({
      id: book.id,
      reason: hits.length
        ? `${book.description} A natural fit for “${hits.slice(0, 2).join("”, “")}”.`
        : `${book.description} A much-loved ${book.category.toLowerCase()} pick from our shelves.`,
    }));
  return { summary: "Here are a few books from our shelves that match what you described.", picks };
}
