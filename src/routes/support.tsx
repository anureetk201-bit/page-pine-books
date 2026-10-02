import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, PackageCheck, RefreshCcw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [
    { title: "Customer Support — Page & Pine" },
    { name: "description", content: "Get help with Page & Pine orders, accounts, book discovery, returns, and delivery." },
    { property: "og:title", content: "Customer Support — Page & Pine" },
    { property: "og:description", content: "Help with Page & Pine orders, accounts, returns, and delivery." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SupportPage,
});

const helpTopics = [
  [PackageCheck, "Orders & delivery", "Track your latest purchases and check their delivery status.", "/orders"],
  [RefreshCcw, "Returns & refunds", "Review an order first, then use your account to request help.", "/orders"],
  [UserRound, "Account help", "Manage your reader profile, saved address, and sign-in details.", "/account"],
  [BookOpen, "Finding a book", "Tell our bookseller what you feel like reading for a tailored shortlist.", "/discover"],
] as const;

function SupportPage() {
  return (
    <main>
      <section className="bg-secondary py-16 text-center sm:py-20">
        <div className="page-container">
          <p className="eyebrow">Page & Pine care</p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">How can we help?</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Find quick help with an order, your account, returns, or choosing your next book.</p>
        </div>
      </section>
      <section className="page-container grid gap-px bg-border py-14 sm:grid-cols-2">
        {helpTopics.map(([Icon, title, description, to]) => (
          <article key={title} className="bg-background p-7 sm:p-9">
            <Icon className="size-7 stroke-[1.4]" />
            <h2 className="mt-5 font-display text-2xl">{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
            <Button asChild variant="link" className="mt-4 h-auto px-0"><Link to={to}>Get help</Link></Button>
          </article>
        ))}
      </section>
    </main>
  );
}