import heroImage from "@/assets/page-pine-hero.webp";

/** Image-backed page header in the same style as the home and about pages. */
export function InfoHero({ eyebrow, title, copy, image = heroImage }: { eyebrow: string; title: string; copy?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/30" />
      <div className="page-container relative py-20 text-primary-foreground sm:py-24">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none sm:text-6xl">{title}</h1>
        {copy && <p className="mt-5 max-w-xl text-sm leading-7 text-primary-foreground/80">{copy}</p>}
      </div>
    </section>
  );
}
