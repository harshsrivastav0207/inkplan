import { NextResponse, type NextRequest } from "next/server";

/*
 * InkPlan is a local-first PWA.
 *
 * Auth is handled entirely on the client via AuthProvider and
 * supabase-js (which refreshes its own tokens in localStorage).
 * Middleware is NOT required for auth to work.
 *
 * Vercel Edge Runtime does not reliably expose NEXT_PUBLIC_*
 * environment variables the way Node.js does, which caused
 * MIDDLEWARE_INVOCATION_FAILED. To keep the app stable we pass
 * every request through and skip server-side session refresh.
 *
 * If you later want server-side session cookies (e.g. for
 * Server Components that require auth), re-add the Supabase
 * refresh logic inside the try/catch below — never outside it.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  /*
   * Run on every route except static assets.
   * The matcher is intentionally broad, but the handler
   * does nothing, so this is effectively a pass-through.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|sw.js|audio/|icons/).*)",
  ],
};