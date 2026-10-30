import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";
import { SUPPORT_EMAIL } from "@/data/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Page & Pine" },
      {
        name: "description",
        content: "The terms that apply when you shop at Page & Pine Bookshop.",
      },
      { property: "og:title", content: "Terms & Conditions — Page & Pine" },
      { property: "og:description", content: "The terms of shopping with Page & Pine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PolicyPage
      eyebrow="Terms"
      title="Terms & Conditions"
      updated="October 2026"
      sections={sections}
    />
  ),
});

const sections = [
  [
    "About these terms",
    "These terms apply whenever you browse or buy from Page & Pine Bookshop. By placing an order you agree to them.",
  ],
  [
    "Your account",
    "Keep your sign-in details private. You are responsible for activity on your account; tell us straight away if you think someone else has used it.",
  ],
  [
    "Orders and pricing",
    "All prices are shown in Indian rupees and include applicable taxes as shown at checkout. An order is confirmed once it appears in your order history. If a book becomes unavailable we will let you know and refund it in full.",
  ],
  [
    "Shipping",
    "We deliver across India. Delivery times are estimates and may vary during holidays or for remote addresses.",
  ],
  [
    "Returns",
    "Books can be returned within 30 days in their original condition. Damaged or incorrect items are replaced free of charge.",
  ],
  [
    "Reviews",
    "Reviews you post must be your own honest opinion and must not contain offensive or unlawful content. We may remove reviews that break these rules.",
  ],
  ["Contact", `Questions about these terms? Write to us at ${SUPPORT_EMAIL}.`],
] as const;
