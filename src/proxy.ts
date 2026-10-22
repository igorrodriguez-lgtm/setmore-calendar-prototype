import { NextResponse, type NextRequest } from "next/server";

// Password gate for the hosted prototype. Active only when SITE_PASSWORD is set (on Vercel);
// local development is unaffected. Any username works; the browser remembers the login.
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return NextResponse.next();
  }
  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Setmore calendar prototype"' },
  });
}

export const config = {
  // Everything except Next's own static files and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
