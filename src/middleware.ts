import { auth } from "./server/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/signin", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Verification routes that require special handling
  const isVerificationRoute = pathname.startsWith("/verification");

  // If user is authenticated and trying to access signin/signup, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !isPublicRoute && !isVerificationRoute) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except api routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};