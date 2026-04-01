import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/products(.*)",
  "/news(.*)",
  "/cart",
  "/checkout",
  "/api/webhooks/(.*)",
  "/api/payos-webhook",
  "/api/hcaptcha-verify",
  "/api/email/(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Protect non-public routes with Clerk auth
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
