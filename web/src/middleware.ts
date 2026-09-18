import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";

const CANONICAL_HOST = "tentamark.com";
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/calisma-alanlari", "/onboarding"];
const AUTH_ROUTES = ["/giris", "/kayit", "/login", "/register"];

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  if (host === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  const pathname = request.nextUrl.pathname;

  // Rate Limiting for sensitive API routes
  if (pathname.startsWith("/api/connections/") || pathname.startsWith("/api/canva/")) {
    const rateLimit = checkRateLimit(request, {
      keyPrefix: "api-connections",
      limit: 30,
      windowSeconds: 60,
    });
    if (!rateLimit.success) {
      return rateLimitErrorResponse(
        rateLimit,
        "Bağlantı istek sıklık sınırı aşıldı. Lütfen 1 dakika sonra tekrar deneyin."
      );
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/giris";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

