import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "frame-src 'self' https://www.google.com",
    "connect-src 'self'",
  ].join("; "),
};

function withSecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|uploads/).*)"],
};
