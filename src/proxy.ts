import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on ALL routes, but only calls the
// expensive auth.getUser() network round-trip when strictly necessary (i.e.
// for /admin/** routes where we need to block unauthenticated access).
//
// For /dashboard/** and public routes the layout.tsx already handles redirects
// via getCurrentClient()/getCurrentProfile() — no need to double-verify here.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Only pay the Supabase network round-trip for /admin routes.
  // All other routes rely on layout-level guards (getCurrentClient / requireAdmin).
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } else {
    // For non-admin routes, just trigger cookie refresh passively (no network call).
    // The supabase client above has already done the cookie setup.
    await supabase.auth.getSession();
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static assets.
     * RSC payload requests (?_rsc=...) still pass through so cookies are
     * refreshed, but we skip the costly auth.getUser() for non-admin paths.
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
