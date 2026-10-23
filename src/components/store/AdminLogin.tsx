import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/page-pine-hero.jpg";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setBusy(false);
  }

  return (
    <main className="relative grid min-h-[560px] place-items-center overflow-hidden bg-secondary px-4 py-16">
      <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover object-[68%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/55 to-primary/35" />
      <form onSubmit={submit} className="relative w-full max-w-sm border border-border/60 bg-card/95 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Lock className="size-5" /></div>
        <p className="eyebrow mt-5 text-center">Store owners only</p>
        <h1 className="mt-2 text-center font-display text-4xl">Admin sign in</h1>
        <label className="mt-6 block text-xs font-semibold">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="mt-4 block text-xs font-semibold">Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="mt-1 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </label>
        {error && <p className="mt-4 text-xs text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard"}</Button>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Only accounts with owner access can open the dashboard.</p>
      </form>
    </main>
  );
}
