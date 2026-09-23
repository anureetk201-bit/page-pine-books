import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { books } from "@/data/books";

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
  .inputValidator((input: unknown) => DiscoverInput.parse(input))
  .handler(async ({ data }): Promise<DiscoveryResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { summary: "", picks: [], error: "Smart discovery is not configured yet." };

    const catalogue = books
      .map((book) => `${book.id} | ${book.title} by ${book.author} | ${book.category} | ${book.description}`)
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
        input: `Reader's request: ${data.query}\n\nCatalogue (id | title by author | category | description):\n${catalogue}`,
        text: { format: { type: "json_schema", name: "shortlist", strict: true, schema: responseSchema } },
      }),
    });

    if (!response.ok || !response.body) {
      if (response.status === 429) return { summary: "", picks: [], error: "Our bookseller is busy right now — try again in a moment." };
      if (response.status === 402) return { summary: "", picks: [], error: "Smart discovery is out of credits. Please top up AI credits to keep using it." };
      return { summary: "", picks: [], error: "Smart discovery could not answer just now." };
    }

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
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") text += event.delta;
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
      return { summary: "", picks: [], error: "Smart discovery could not answer just now." };
    }
  });
