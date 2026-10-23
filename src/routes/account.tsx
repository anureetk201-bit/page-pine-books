import { createFileRoute, Link } from "@tanstack/react-router";
import { RecommendedForYou } from "@/components/store/RecommendedForYou";
import heroImage from "@/assets/page-pine-hero.jpg";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Page & Pine" }, { name: "description", content: "Sign in, manage your profile, and review Page & Pine orders." }, { property: "og:title", content: "Account — Page & Pine" }, { property: "og:description", content: "Your Page & Pine reader account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").select("full_name, saved_addresses").eq("id", user.id).maybeSingle().then(({ data }) => {
      setName(data?.full_name ?? String(user.user_metadata["full_name"] ?? ""));
      const saved = Array.isArray(data?.saved_addresses) ? data.saved_addresses : [];
      setAddress(typeof saved[0] === "string" ? saved[0] : "");
    });
  }, [user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error?.message ?? "Welcome back.");
    } else {
      const fullName = String(form.get("name") ?? "");
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/account", data: { full_name: fullName } } });
      if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName });
      setMessage(error?.message ?? "Check your email to confirm your account.");
    }
    setBusy(false);
  }

  async function googleSignIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/account" });
    if (result.error) setMessage(result.error.message);
    setBusy(false);
  }

  if (loading) return <main className="grid min-h-[620px] place-items-center bg-secondary"><p className="eyebrow">Opening your account…</p></main>;
  if (user) return <main className="page-container py-16"><div className="mx-auto max-w-3xl"><p className="eyebrow">Reader account</p><h1 className="mt-2 font-display text-5xl">Welcome, {name || "reader"}.</h1><p className="mt-3 text-sm text-muted-foreground">{user.email}</p><div className="mt-10 grid gap-5 border-y border-border py-8 sm:grid-cols-3"><AccountStat label="Saved books" value="Your wishlist"/><AccountStat label="Shopping bag" value="Saved across devices"/><AccountStat label="Orders" value="Order history"/></div><form className="mt-10 grid gap-4 border border-border bg-card p-6 sm:grid-cols-2" onSubmit={async(e)=>{e.preventDefault();setBusy(true);const {error}=await supabase.from("profiles").upsert({id:user.id,full_name:name,saved_addresses:address?[address]:[]});setMessage(error?.message??"Profile saved.");setBusy(false)}}><div className="sm:col-span-2"><p className="eyebrow">Profile details</p><h2 className="mt-1 font-display text-2xl">Your preferences</h2></div><label><span className="mb-1.5 block text-xs font-semibold">Full name</span><input value={name} onChange={e=>setName(e.target.value)} className="h-11 w-full border border-input bg-background px-3"/></label><label><span className="mb-1.5 block text-xs font-semibold">Saved address</span><input value={address} onChange={e=>setAddress(e.target.value)} className="h-11 w-full border border-input bg-background px-3"/></label><div className="sm:col-span-2 flex flex-wrap items-center gap-3"><Button disabled={busy} type="submit">Save profile</Button>{message&&<span className="text-xs text-muted-foreground" role="status">{message}</span>}</div></form><div className="mt-10 flex flex-wrap gap-3"><Button asChild><Link to="/orders">View order history</Link></Button><Button asChild variant="outline"><Link to="/wishlist">Your wishlist</Link></Button><Button asChild variant="ghost" className="text-xs underline"><Link to="/admin">Store dashboard</Link></Button></div><RecommendedForYou className="mt-14"/><Button className="mt-8" variant="outline" onClick={() => void supabase.auth.signOut()}><LogOut/> Sign out</Button></div></main>;

  return <main className="relative grid min-h-[660px] place-items-center overflow-hidden bg-secondary px-4 py-16"><img src={heroImage} alt="" className="absolute inset-0 size-full object-cover object-[68%_center]"/><div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/55 to-primary/35"/><div className="relative w-full max-w-md border border-border/60 bg-card/95 p-7 shadow-2xl backdrop-blur-sm sm:p-10"><p className="eyebrow text-center">Welcome to Page & Pine</p><h1 className="mt-2 text-center font-display text-4xl">{mode === "signin" ? "Sign in" : "Create account"}</h1><form className="mt-7 space-y-4" onSubmit={submit}>{mode === "register" && <Field name="name" label="Full name" type="text"/>}<Field name="email" label="Email address" type="email"/><Field name="password" label="Password" type="password"/><Button disabled={busy} type="submit" size="lg" className="w-full">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button></form><div className="my-5 flex items-center gap-3 text-[10px] uppercase text-muted-foreground"><span className="h-px flex-1 bg-border"/>or<span className="h-px flex-1 bg-border"/></div><Button disabled={busy} type="button" variant="outline" size="lg" className="w-full" onClick={() => void googleSignIn()}>Continue with Google</Button>{message && <p className="mt-4 text-center text-xs leading-5 text-muted-foreground" role="status">{message}</p>}<Button variant="ghost" className="mt-4 w-full text-xs underline" onClick={() => { setMode(mode === "signin" ? "register" : "signin"); setMessage(""); }}>{mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}</Button></div></main>;
}

function Field({ name, label, type }: { name: string; label: string; type: string }) { return <label><span className="mb-1.5 block text-xs font-semibold">{label}</span><input name={name} required minLength={type === "password" ? 8 : undefined} type={type} autoComplete={type === "password" ? "current-password" : name} className="h-11 w-full border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"/></label>; }
function AccountStat({ label, value }: { label: string; value: string }) { return <div><p className="eyebrow">{label}</p><p className="mt-2 font-display text-xl">{value}</p></div>; }