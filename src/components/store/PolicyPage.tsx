import { InfoHero } from "./InfoHero";

/** Shared layout for long-form policy pages such as privacy and terms. */
export function PolicyPage({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: readonly (readonly [string, string])[] }) {
  return (
    <main>
      <InfoHero eyebrow={eyebrow} title={title} copy={`Last updated ${updated}`} />
      <section className="page-container grid gap-10 py-16 lg:grid-cols-[240px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-6 space-y-2 text-xs text-muted-foreground">
            {sections.map(([heading], i) => <li key={heading}><a href={`#section-${i + 1}`} className="hover:text-foreground">{i + 1}. {heading}</a></li>)}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-10">
          {sections.map(([heading, body], i) => (
            <article key={heading} id={`section-${i + 1}`} className="scroll-mt-24">
              <h2 className="font-display text-3xl">{i + 1}. {heading}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
