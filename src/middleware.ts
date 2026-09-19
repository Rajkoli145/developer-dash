import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasValidSession, SESSION_COOKIE } from "@/lib/session-edge";

const PUBLIC_PAGES = ["/login", "/setup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isPublicApi = pathname.startsWith("/api/auth");
  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isAsset || isPublicApi) return NextResponse.next();

  const authed = await hasValidSession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!authed && !isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (authed && isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static files and uploads API (uploads are served by their own route).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
