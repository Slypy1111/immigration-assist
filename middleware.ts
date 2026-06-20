import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEV_AUTH_COOKIE,
  isClerkKeyInvalid,
  isDevAuthMode,
} from "@/lib/auth/config";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/dev-login(.*)",
  "/setup/clerk(.*)",
  "/api/webhooks(.*)",
]);

function isDevPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/dev-login") ||
    pathname.startsWith("/setup/clerk") ||
    pathname.startsWith("/api/webhooks")
  );
}

function devAuthMiddleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (isDevPublicPath(pathname)) {
    return NextResponse.next();
  }

  const role = req.cookies.get(DEV_AUTH_COOKIE)?.value;
  if (!role) {
    const loginUrl = new URL("/dev-login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isClerkKeyInvalid() && !request.nextUrl.pathname.startsWith("/setup/clerk")) {
    return NextResponse.redirect(new URL("/setup/clerk", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: unknown) {
  if (isDevAuthMode()) {
    return devAuthMiddleware(req);
  }
  return clerkHandler(req, event as never);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
