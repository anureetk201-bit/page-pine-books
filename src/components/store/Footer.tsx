import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false);
  return done ? <p className="font-semibold text-accent">Thanks for subscribing!</p> : <form className={`flex ${compact ? "max-w-sm" : "max-w-md"}`} onSubmit={(e) => { e.preventDefault(); if (e.currentTarget.checkValidity()) setDone(true); }}>
    <label className="sr-only" htmlFor={compact ? "footer-email" : "newsletter-email"}>Email address</label>
    <input id={compact ? "footer-email" : "newsletter-email"} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="min-w-0 flex-1 rounded-l-sm border-0 bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring focus:ring-2" />
    <Button type="submit" variant="gold" className="rounded-l-none">Subscribe</Button>
  </form>;
}

export function Footer() {
  return <footer className="bg-primary text-primary-foreground">
    <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,0.7fr)_1.35fr]">
      <div><Brand inverted /><p className="mt-5 max-w-xs text-sm leading-6 text-primary-foreground/70">We believe books have the power to change lives, one beautiful page at a time.</p><div className="mt-5 flex gap-2">{[Facebook, Instagram, Youtube].map((Icon, i) => <a key={i} href="#" aria-label={["Facebook","Instagram","YouTube"][i]} className="grid size-8 place-items-center rounded-full border border-primary-foreground/20 hover:bg-primary-foreground/10"><Icon className="size-4" /></a>)}</div></div>
      <FooterCol title="Shop" links={[["All Books","/books"],["New Arrivals","/new-arrivals"],["Bestsellers","/bestsellers"],["Special Offers","/books"],["Gift Cards","/books"]]} />
      <FooterCol title="Help" links={[["FAQs","/about"],["Shipping & Delivery","/about"],["Returns & Refunds","/about"],["Track Order","/account"],["Contact Us","/about"]]} />
      <FooterCol title="About" links={[["Our Story","/about"],["Careers","/about"],["Blog","/about"],["Privacy Policy","/about"],["Terms & Conditions","/about"]]} />
      <div><h3 className="footer-title">Newsletter</h3><p className="mb-4 text-xs text-primary-foreground/65">Join our community of readers.</p><NewsletterForm compact /><div className="mt-5 flex gap-2 text-[10px] font-bold"><span className="payment">VISA</span><span className="payment">●●</span><span className="payment">PayPal</span><span className="payment">Pay</span></div></div>
    </div>
    <div className="border-t border-primary-foreground/10 py-4 text-center text-[10px] text-primary-foreground/55">© 2026 Page & Pine Bookshop. All Rights Reserved.</div>
  </footer>;
}
function FooterCol({ title, links }: { title: string; links: readonly (readonly [string,string])[] }) { return <div><h3 className="footer-title">{title}</h3><ul className="space-y-2">{links.map(([label,to]) => <li key={label}><Link to={to} className="text-xs text-primary-foreground/65 transition hover:text-primary-foreground">{label}</Link></li>)}</ul></div>; }
