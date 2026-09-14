export function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="border-b border-border bg-secondary/60"><div className="page-container py-12 text-center sm:py-16"><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1>{copy && <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy}</p>}</div></div>;
}
