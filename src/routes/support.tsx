import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Clock,
  CreditCard,
  Mail,
  PackageCheck,
  Phone,
  RefreshCcw,
  Truck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoHero } from "@/components/store/InfoHero";
import { PaymentBadges } from "@/components/store/PaymentBadges";
import { SUPPORT_EMAIL, SUPPORT_HOURS, SUPPORT_PHONE } from "@/data/site";
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/currency";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Customer Support — Page & Pine" },
      {
        name: "description",
        content:
          "Get help with Page & Pine orders, accounts, book discovery, returns, and delivery.",
      },
      { property: "og:title", content: "Customer Support — Page & Pine" },
      {
        property: "og:description",
        content: "Help with Page & Pine orders, accounts, returns, and delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportPage,
});

const helpTopics = [
  [
    PackageCheck,
    "Orders & delivery",
    "Track your latest purchases and check their delivery status.",
    "/orders",
  ],
  [
    RefreshCcw,
    "Returns & refunds",
    "Review an order first, then use your account to request help.",
    "/orders",
  ],
  [
    UserRound,
    "Account help",
    "Manage your reader profile, saved address, and sign-in details.",
    "/account",
  ],
  [
    BookOpen,
    "Finding a book",
    "Tell our bookseller what you feel like reading for a tailored shortlist.",
    "/discover",
  ],
] as const;

const faqs = [
  [
    "Do I need an account to order?",
    "You can browse and fill your bag without one, but you need to sign in to place an order so it is saved to your order history.",
  ],
  [
    "How do I track my order?",
    "Open Order history from your account. Every order shows its current status, the titles inside, and the total paid.",
  ],
  [
    "Can I change or cancel an order?",
    "Write to us within 12 hours of ordering and we will update or cancel it before it is packed.",
  ],
  [
    "Are the books new?",
    "Yes. Every book we ship is brand new and checked by hand before it is packed.",
  ],
  [
    "Do you ship outside India?",
    "We currently deliver across India only. International shipping is on our roadmap.",
  ],
  [
    "Can I save books for later?",
    "Tap the heart on any book to add it to your wishlist. Signed-in readers see their wishlist on every device.",
  ],
] as const;

function SupportPage() {
  return (
    <main>
      <InfoHero
        eyebrow="Page & Pine care"
        title="How can we help?"
        copy="Find quick help with an order, your account, returns, or choosing your next book."
      />

      <section className="page-container grid gap-px bg-border py-14 sm:grid-cols-2">
        {helpTopics.map(([Icon, title, description, to]) => (
          <article key={title} className="bg-background p-7 sm:p-9">
            <Icon className="size-7 stroke-[1.4]" />
            <h2 className="mt-5 font-display text-2xl">{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
            <Button asChild variant="link" className="mt-4 h-auto px-0">
              <Link to={to}>Get help</Link>
            </Button>
          </article>
        ))}
      </section>

      <section id="faqs" className="scroll-mt-24 bg-secondary py-16">
        <div className="page-container">
          <p className="eyebrow">FAQs</p>
          <h2 className="section-heading mt-2">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl">
                  {question}
                  <span className="text-2xl text-muted-foreground transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container grid gap-12 py-16 lg:grid-cols-2">
        <article id="shipping" className="scroll-mt-24">
          <Truck className="size-8 stroke-[1.3]" />
          <h2 className="section-heading mt-4">Shipping & delivery</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="text-foreground">Free shipping</strong> on every order over{" "}
              {formatPrice(FREE_SHIPPING_THRESHOLD)}. Smaller orders ship for a flat{" "}
              {formatPrice(SHIPPING_FEE)}.
            </li>
            <li>
              <strong className="text-foreground">Dispatch</strong> within 1–2 business days of
              ordering.
            </li>
            <li>
              <strong className="text-foreground">Delivery</strong> in 3–5 business days to metro
              cities and 5–8 days elsewhere in India.
            </li>
            <li>
              You can follow every order from your{" "}
              <Link to="/orders" className="underline">
                order history
              </Link>
              .
            </li>
          </ul>
        </article>
        <article id="returns" className="scroll-mt-24">
          <RefreshCcw className="size-8 stroke-[1.3]" />
          <h2 className="section-heading mt-4">Returns & refunds</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="text-foreground">30-day returns</strong> on books in their original
              condition.
            </li>
            <li>
              <strong className="text-foreground">Damaged or wrong book?</strong> We replace it free
              of charge — just send us a photo.
            </li>
            <li>
              <strong className="text-foreground">Refunds</strong> go back to your original payment
              method within 5–7 business days of the return reaching us.
            </li>
            <li>
              To start a return, email us with your order number from{" "}
              <Link to="/orders" className="underline">
                order history
              </Link>
              .
            </li>
          </ul>
        </article>
      </section>

      <section id="payments" className="scroll-mt-24 border-y border-border bg-card py-14">
        <div className="page-container grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <CreditCard className="size-8 stroke-[1.3]" />
            <h2 className="section-heading mt-4">Payment methods</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              We accept major credit and debit cards, UPI, wallets, and PayPal. Payments are
              processed over an encrypted connection and we never store your card details.
            </p>
          </div>
          <PaymentBadges />
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 page-container py-16">
        <p className="eyebrow">Contact us</p>
        <h2 className="section-heading mt-2">Talk to a bookseller</h2>
        <div className="mt-8 grid gap-px bg-border sm:grid-cols-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="bg-background p-7 transition hover:bg-secondary"
          >
            <Mail className="size-6 stroke-[1.4]" />
            <p className="mt-4 eyebrow">Email</p>
            <p className="mt-1 font-display text-xl">{SUPPORT_EMAIL}</p>
          </a>
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
            className="bg-background p-7 transition hover:bg-secondary"
          >
            <Phone className="size-6 stroke-[1.4]" />
            <p className="mt-4 eyebrow">Phone</p>
            <p className="mt-1 font-display text-xl">{SUPPORT_PHONE}</p>
          </a>
          <div className="bg-background p-7">
            <Clock className="size-6 stroke-[1.4]" />
            <p className="mt-4 eyebrow">Hours</p>
            <p className="mt-1 font-display text-xl">{SUPPORT_HOURS}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
