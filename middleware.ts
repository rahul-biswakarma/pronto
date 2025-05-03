import { type NextRequest, NextResponse } from "next/server";
import logger from "./libs/utils/logger";
import { apiRatelimit, ratelimit } from "./libs/utils/ratelimit";
import { updateSession } from "./supabase/utils/middleware";

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
    if (!request.nextUrl.pathname.startsWith("/_next")) {
        const subdomains = request.headers.get("host")?.split(".");
        const subdomain = subdomains?.[0];
        // Also check if it's not an API route before rewriting
        if (
            subdomain &&
            subdomain !== process.env.NEXT_PUBLIC_DOMAIN &&
            !request.nextUrl.pathname.startsWith("/api")
        ) {
            const rewriteUrl = new URL(
                `/api/preview/${subdomain}/${request.nextUrl.pathname}`,
                request.url,
            );

            return NextResponse.rewrite(rewriteUrl);
        }
    }
    // Check if this is an API route
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");

    // Skip rate limiting for auth callback routes (handle both formats)
    const isAuthCallback =
        request.nextUrl.pathname === "/api/auth/callback" ||
        request.nextUrl.pathname.includes("/callback") ||
        request.nextUrl.pathname.includes("/auth/callback");

    let limit: number | undefined;
    let reset: number | undefined;
    let remaining: number | undefined;

    if (!isAuthCallback) {
        // Apply rate limiting for all routes except auth callback
        // Apply rate limiting
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
            ? forwarded.split(",")[0]
            : request.headers.get("x-real-ip") || "127.0.0.1";
        const identifier = `${ip}:${request.nextUrl.pathname}`;

        logger.debug(
            { ip, path: request.nextUrl.pathname },
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
                    { ip, path: request.nextUrl.pathname },
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
                { error, path: request.nextUrl.pathname },
                "Rate limiting error",
            );
            // Continue processing the request if rate limiting fails
        }
    }

    // Continue with session handling if rate limit not exceeded
    let response: NextResponse;

    try {
        const sessionResponse = await updateSession(
            request,
            NextResponse.next(),
            {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
        );

        response = sessionResponse.response;
        const user = sessionResponse.user;

        // Skip login redirect for auth callback routes
        if (
            !request.nextUrl.pathname.endsWith("/login") &&
            !request.nextUrl.pathname.includes("/") &&
            !user &&
            !isAuthCallback
        ) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } catch (error) {
        logger.error({ error }, "Error in session middleware");
        response = NextResponse.next();
    }

    if (
        !isAuthCallback &&
        limit !== undefined &&
        remaining !== undefined &&
        reset !== undefined
    ) {
        // Add rate limit headers to all responses (except auth callback)
        response.headers.set("X-RateLimit-Limit", limit.toString());
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set("X-RateLimit-Reset", reset.toString());
    }

    // Add security headers to all responses
    for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
