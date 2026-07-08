import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  // Support domain
  if (host === "app-codfel.vercel.app") {
    if (url.pathname.startsWith("/student")) {
      url.pathname = url.pathname.replace("/student", "") || "/";
    }

    url.pathname = `/student${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Distributor domain
  if (host === "admin-codfel.vercel.app") {
    if (url.pathname.startsWith("/admin")) {
      url.pathname = url.pathname.replace("/admin", "") || "/";
    }

    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Launchgate domain
  if (host === "staff-codfel.vercel.app") {
    if (url.pathname.startsWith("/lecturer")) {
      url.pathname = url.pathname.replace("/lecturer", "") || "/";
    }

    url.pathname = `/lecturer${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
