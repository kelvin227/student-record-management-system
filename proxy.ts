import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  // Support domain
  if (host === "app-codfel.vercel.app") {
    url.pathname = `/student${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Distributor domain
  if (host === "admin-codfel.vercel.app") {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Launchgate domain
  if (host === "staff-codfel.vercelapp") {
    url.pathname = `/lecturer${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};