import { createFileRoute, Link } from "@tanstack/react-router";
import newsletterImage from "@/assets/page-pine-newsletter.jpg";
import fictionImage from "@/assets/cat-fiction.jpg";
import selfhelpImage from "@/assets/cat-selfhelp.jpg";
import classicsImage from "@/assets/cat-classics.jpg";
import { InfoHero } from "@/components/store/InfoHero";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [
    { title: "Journal — Page & Pine" },
    { name: "description", content: "Reading lists, bookseller notes, and stories from the Page & Pine shelves." },
    { property: "og:title", content: "Journal — Page & Pine" },
    { property: "og:description", content: "Reading lists and notes from our booksellers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: BlogPage,
});

const posts = [
  {
    image: fictionImage, tag: "Reading list", date: "October 2026", title: "Novels for a quiet weekend",
    body: "Some books ask to be read slowly, with a pot of tea and nowhere to be. Start with The Midnight Library for its gentle meditation on regret, then lose yourself in the marshes of Where the Crawdads Sing.",
    link: { to: "/categories/$slug", params: { slug: "fiction" }, label: "Browse fiction" },
  },
  {
    image: selfhelpImage, tag: "Bookseller notes", date: "September 2026", title: "Small habits, big shifts",
    body: "Atomic Habits remains our most-gifted book for a reason: its ideas are practical from the first chapter. Pair it with Four Thousand Weeks for a kinder view of how we spend our time.",
    link: { to: "/categories/$slug", params: { slug: "self-help" }, label: "Browse self-help" },
  },
  {
    image: classicsImage, tag: "Timeless", date: "August 2026", title: "Why we keep returning to the classics",
    body: "From the glittering parties of The Great Gatsby to the quiet courage of Jane Eyre, the classics keep finding new readers because they speak to things that never change.",
    link: { to: "/categories/$slug", params: { slug: "classics" }, label: "Browse classics" },
  },
] as const;

function BlogPage() {
  return (
    <main>
      <InfoHero eyebrow="The Page & Pine journal" title="Notes from our shelves." copy="Reading lists, bookseller picks, and the stories behind the books we love." image={newsletterImage} />
      <section className="page-container grid gap-10 py-16 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.title} className="flex flex-col border border-border bg-card">
            <img src={post.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-1 flex-col p-6">
              <p className="eyebrow">{post.tag} · {post.date}</p>
              <h2 className="mt-3 font-display text-2xl leading-tight">{post.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.body}</p>
              <Link to={post.link.to} params={post.link.params} className="mt-5 text-[11px] font-bold uppercase underline">{post.link.label}</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
