import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/",
  "/dex",
  "/login",
  "/signup",
  "/scan",
  "/confirm",
  "/map",
  "/regions",
];
const PUBLIC_PREFIXES = ["/animal/"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Write updated tokens back to the request for upstream Server Components
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create the response so the new cookies are included
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // getUser() contacts the Supabase Auth server to verify the token.
  // Do NOT use getSession() here — it only reads cookies and is unverified.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicRoute =
    PUBLIC_ROUTES.includes(path) ||
    PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && AUTH_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|sprites/).*)"],
};
