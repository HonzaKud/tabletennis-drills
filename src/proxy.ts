import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16: "middleware" convention is deprecated in favor of "proxy".
 * This runs before routes and can redirect unauthenticated users away from protected pages.
 *
 * IMPORTANT:
 * - Runs on Edge runtime -> do not import Node/server-only modules.
 * - We only check presence of cookie here.
 */

const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE_NAME || "ttd_session";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/invite/")) return true;

  // Auth APIs must remain public
  if (pathname.startsWith("/api/auth/")) return true;

  // Your debug endpoint
  if (pathname.startsWith("/api/debug/")) return true;

  // Next internals / static
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;

  return false;
}

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/drills" || pathname.startsWith("/drills/")) return true;

  // OPTIONAL: protect homepage too
  // if (pathname === "/") return true;

  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value?.trim();
  if (sessionId) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
