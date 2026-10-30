import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Coffee, HeartHandshake, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoHero } from "@/components/store/InfoHero";
import { SUPPORT_EMAIL } from "@/data/site";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Page & Pine" },
      {
        name: "description",
        content: "Join the Page & Pine team and help readers find books that stay with them.",
      },
      { property: "og:title", content: "Careers — Page & Pine" },
      { property: "og:description", content: "Open roles at Page & Pine Bookshop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareersPage,
});

const perks = [
  [BookOpen, "A book allowance", "A monthly allowance to read anything on our shelves."],
  [Coffee, "Flexible days", "Hybrid schedules built around focused work and real rest."],
  [HeartHandshake, "Small, kind team", "Thoughtful colleagues who care about craft and readers."],
] as const;

const roles = [
  [
    "Bookseller & Curator",
    "Bengaluru · Full-time",
    "Shape our shelves, write recommendations, and help readers find their next favourite book.",
  ],
  [
    "Customer Care Associate",
    "Remote · Full-time",
    "Look after orders, returns, and reader questions with warmth and care.",
  ],
  [
    "Fulfilment Coordinator",
    "Bengaluru · Full-time",
    "Pack every order beautifully and keep our stock accurate.",
  ],
  [
    "Content & Community Intern",
    "Remote · 6 months",
    "Help run our newsletter, reading lists, and social channels.",
  ],
] as const;

function CareersPage() {
  return (
    <main>
      <InfoHero
        eyebrow="Careers"
        title="Help readers find stories that stay."
        copy="We are a small, independent team that loves books and the people who read them."
      />
      <section className="bg-secondary">
        <div className="page-container grid gap-px bg-border py-14 md:grid-cols-3">
          {perks.map(([Icon, title, copy]) => (
            <article key={title} className="bg-secondary p-8">
              <Icon className="size-8 stroke-1" />
              <h2 className="mt-5 font-display text-2xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="page-container py-16">
        <p className="eyebrow">Open roles</p>
        <h2 className="section-heading mt-2">Join the team</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {roles.map(([title, place, copy]) => (
            <article key={title} className="flex flex-wrap items-center justify-between gap-5 py-6">
              <div className="max-w-2xl">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {place}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>
              <Button asChild variant="outline">
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Application: ${title}`)}`}
                >
                  Apply now
                </a>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Don’t see your role? Send your CV to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
