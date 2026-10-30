import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";
import { SUPPORT_EMAIL } from "@/data/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Page & Pine" },
      {
        name: "description",
        content: "How Page & Pine collects, uses, and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Page & Pine" },
      { property: "og:description", content: "How we look after your information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PolicyPage
      eyebrow="Privacy"
      title="Privacy Policy"
      updated="October 2026"
      sections={sections}
    />
  ),
});

const sections = [
  [
    "Information we collect",
    "When you create an account or place an order we collect your name, email address, shipping address, and phone number. We also keep the books in your bag, wishlist, and order history so they follow you across devices.",
  ],
  [
    "How we use it",
    "We use your information to process and deliver orders, provide customer support, personalise book recommendations, and — only if you subscribe — send our newsletter.",
  ],
  [
    "Payments",
    "Card and UPI payments are handled by our payment partners over encrypted connections. We never store your full card number.",
  ],
  [
    "Sharing",
    "We share only what is needed with delivery and payment partners to complete your order. We never sell your personal information.",
  ],
  [
    "Cookies and storage",
    "We use essential cookies and your browser's local storage to keep you signed in, remember your bag, and save your language preference.",
  ],
  [
    "Your choices",
    "You can update your profile from your account page, unsubscribe from emails at any time, or ask us to delete your account and data.",
  ],
  ["Contact", `Questions about your privacy? Write to us at ${SUPPORT_EMAIL}.`],
] as const;
