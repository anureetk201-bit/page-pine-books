import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const AdminSignInInput = z.object({ id: z.string().min(1).max(200), password: z.string().min(1).max(200) });

export type AdminSignInResult =
  | { ok: true; access_token: string; refresh_token: string }
  | { ok: false; error: string };

// The Supabase account behind the fixed admin ID. It is created on first sign-in, already confirmed.
const DEFAULT_ADMIN_EMAIL = "store-admin@pageandpine.in";

async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

/** Compares secrets without leaking how many leading characters matched. */
async function safeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/**
 * Signs in with the store's fixed admin ID and password, kept in the ADMIN_ID and ADMIN_PASSWORD
 * server secrets. Makes sure the matching account exists and holds the admin role, then returns a session.
 */
export const adminSignIn = createServerFn({ method: "POST" })
  .validator((input: unknown) => AdminSignInInput.parse(input))
  .handler(async ({ data }): Promise<AdminSignInResult> => {
    const adminId = process.env["ADMIN_ID"];
    const adminPassword = process.env["ADMIN_PASSWORD"];
    if (!adminId || !adminPassword) {
      return { ok: false, error: "Admin login isn't set up yet. Add the ADMIN_ID and ADMIN_PASSWORD secrets in Lovable Cloud." };
    }
    const [idMatches, passwordMatches] = await Promise.all([safeEqual(data.id.trim(), adminId), safeEqual(data.password, adminPassword)]);
    if (!idMatches || !passwordMatches) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return { ok: false, error: "Incorrect admin ID or password." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = process.env["ADMIN_EMAIL"] || DEFAULT_ADMIN_EMAIL;

    // Create the admin account on first use; afterwards keep its password in step with the secret.
    let userId: string | undefined;
    const created = await supabaseAdmin.auth.admin.createUser({ email, password: adminPassword, email_confirm: true, user_metadata: { full_name: "Store admin" } });
    if (created.data.user) userId = created.data.user.id;
    else {
      for (let page = 1; !userId && page <= 20; page++) {
        const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) return { ok: false, error: error.message };
        userId = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
        if (list.users.length < 1000) break;
      }
      if (!userId) return { ok: false, error: created.error?.message ?? "Could not create the admin account." };
      const updated = await supabaseAdmin.auth.admin.updateUserById(userId, { password: adminPassword, email_confirm: true });
      if (updated.error) return { ok: false, error: updated.error.message };
    }

    const role = await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (role.error) return { ok: false, error: role.error.message };
    await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: "Store admin" }, { onConflict: "id", ignoreDuplicates: true });

    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return { ok: false, error: "Supabase isn't configured on the server." };
    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }).auth;
    const { data: signedIn, error } = await auth.signInWithPassword({ email, password: adminPassword });
    if (error || !signedIn.session) return { ok: false, error: error?.message ?? "Sign-in failed." };
    return { ok: true, access_token: signedIn.session.access_token, refresh_token: signedIn.session.refresh_token };
  });
