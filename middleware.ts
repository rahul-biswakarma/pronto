import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./libs/supabase/middleware";
import logger from "./libs/utils/logger";
import { apiRatelimit, ratelimit } from "./libs/utils/ratelimit";

// Security headers to protect against common attacks
const securityHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export async function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // --- BEGIN HOSTNAME CHECK ---
    // If accessing the root path '/'
    if (pathname === "/") {
        // Check if the hostname is *.feno.app
        if (hostname.endsWith(".feno.app")) {
            // Let the request proceed to app/(subdomain)/page.tsx
            // No rewrite needed here, Next.js routing handles it
            logger.info({ hostname, pathname }, "Serving subdomain root");
        } else {
            // If not *.feno.app, rewrite to the main homepage (app/page.tsx)
            // Assumes your main homepage is at the root level in the app dir
            logger.info(
                { hostname, pathname },
                "Rewriting root path to main homepage",
            );
            // Use NextResponse.rewrite to internally show the main page content
            // without changing the URL in the browser bar.
            // If you want to redirect (change URL), use NextResponse.redirect instead.
            // If you want a 404, return new NextResponse(null, { status: 404 });
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = "/home"; // Or whatever your main page route actually is, without the /app part.
            // If your main page IS app/page.tsx, this rewrite might need adjustment
            // depending on how Next handles root rewrites.
            // Let's assume for now there's a distinct route like '/home'.
            // If app/page.tsx is the main page, we might need a different strategy
            // like moving the main page to app/home/page.tsx.
            return NextResponse.rewrite(rewriteUrl);
        }
    }
    // --- END HOSTNAME CHECK ---

    // Check if this is an API route
    const isApiRoute = pathname.startsWith("/api");

    // Skip rate limiting for auth callback routes (handle both formats)
    const isAuthCallback =
        pathname === "/api/auth/callback" ||
        pathname.includes("/callback") || // Adjusted to check pathname
        pathname.includes("/auth/callback"); // Adjusted to check pathname

    let limit: number | undefined;
    let reset: number | undefined;
    let remaining: number | undefined;

    // Apply rate limiting for all routes except auth callback
    if (!isAuthCallback) {
        // Apply rate limiting
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
            ? forwarded.split(",")[0]
            : request.headers.get("x-real-ip") || "127.0.0.1";
        const identifier = `${ip}:${pathname}`; // Use pathname from destructuring

        logger.debug(
            { ip, path: pathname }, // Use pathname
            "Rate limiting request",
        );

        // Use different rate limits for API routes vs regular pages
        const limiter = isApiRoute ? apiRatelimit : ratelimit;
        try {
            const {
                success,
                limit: rateLimit,
                reset: rateReset,
                remaining: rateRemaining,
            } = await limiter.limit(identifier);

            limit = rateLimit;
            reset = rateReset;
            remaining = rateRemaining;

            // If rate limit is exceeded, return 429 Too Many Requests
            if (!success) {
                logger.warn(
                    { ip, path: pathname }, // Use pathname
                    "Rate limit exceeded",
                );
                return new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                        "Retry-After": Math.ceil(
                            (reset - Date.now()) / 1000,
                        ).toString(),
                        ...securityHeaders,
                    },
                });
            }
        } catch (error) {
            logger.error(
                { error, path: pathname }, // Use pathname
                "Rate limiting error",
            );
            // Continue processing the request if rate limiting fails
        }
    }

    // Continue with session handling if rate limit not exceeded
    let response: NextResponse;

    try {
        // Directly pass request and create a base response if needed.
        const baseResponse = NextResponse.next({
            request: {
                headers: new Headers(request.headers), // Pass headers along
            },
        });
        const sessionResponse = await updateSession(request, baseResponse, {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });

        response = sessionResponse.response;
        const user = sessionResponse.user;

        // Skip login redirect for auth callback routes and API routes
        // Also skip for root path handled by hostname check earlier
        if (
            pathname !== "/" && // Exclude root path check
            !isApiRoute && // Exclude API routes
            !pathname.endsWith("/login") &&
            !pathname.startsWith("/_next") && // Ensure Next.js internals are skipped
            !user &&
            !isAuthCallback
        ) {
            // Redirect to /login only if not already on /login and not user
            // Check if the original request path requires auth
            const requiresAuth = !["/login"].includes(pathname); // Add public paths here if needed
            if (requiresAuth && !user) {
                logger.info(
                    { pathname },
                    "Redirecting unauthenticated user to login",
                );
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }
    } catch (error) {
        logger.error({ error }, "Error in session middleware");
        // Ensure we return a response even if session handling fails
        response = NextResponse.next({
            request: {
                headers: new Headers(request.headers),
            },
        });
    }

    // Add rate limit headers to all responses (except auth callback)
    if (
        !isAuthCallback &&
        limit !== undefined &&
        remaining !== undefined &&
        reset !== undefined
    ) {
        response.headers.set("X-RateLimit-Limit", limit.toString());
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set("X-RateLimit-Reset", reset.toString());
    }

    // Add security headers to all responses
    for (const [key, value] of Object.entries(securityHeaders)) {
        if (!response.headers.has(key)) {
            // Avoid overriding headers set earlier (like rate limit)
            response.headers.set(key, value);
        }
    }

    return response;
}

export const config = {
    matcher: [
        // Updated matcher to include root path explicitly if needed,
        // or rely on the existing one which should cover it.
        // The existing matcher seems broad enough.
        "/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
