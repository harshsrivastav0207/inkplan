import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (cached) {
    return cached;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * During `next build`, Next.js prerenders client components.
   * If env vars are not visible to the build process, we return
   * a stub client that throws only if a method is actually called.
   *
   * The stub is never used during prerender because AuthProvider
   * does not touch the client until a browser effect runs.
   *
   * In the browser, env vars are present (they were inlined at
   * build time), so the real client is created and cached.
   */
  if (!url || !key) {
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error(
          "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
        );
      },
    });
  }

  cached = createBrowserClient(url, key);
  return cached;
}