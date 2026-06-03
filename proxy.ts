import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/sign-in", "/api/webhooks"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isApiAuthRoute = pathname.startsWith("/api/auth");

  // Get session
  const session = await auth();
  const isAuthenticated = !!session;

  // Allow public routes and API auth routes
  if (isPublicRoute || isApiAuthRoute) {
    // If authenticated user tries to access auth pages, redirect to home
    if (isAuthenticated && isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (!isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
