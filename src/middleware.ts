import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/cadastro", "/api"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const token = request.cookies.get("su_session")?.value;
  const session = token ? await verifyToken(token) : null;

  // Redirect authenticated users away from auth pages
  if (session && (pathname === "/login" || pathname === "/cadastro")) {
    return NextResponse.redirect(new URL("/rotinas", request.url));
  }

  // Redirect unauthenticated users to login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
