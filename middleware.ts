import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./supabase/middleware";
import { apiRatelimit, ratelimit } from "./utils/ratelimit";

export async function middleware(request: NextRequest) {
    // Check if this is an API route
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");

    // Apply rate limiting
    const ip = request.ip ?? "127.0.0.1";
    const identifier = `${ip}:${request.nextUrl.pathname}`;

    // Use different rate limits for API routes vs regular pages
    const limiter = isApiRoute ? apiRatelimit : ratelimit;
    const { success, limit, reset, remaining } =
        await limiter.limit(identifier);

    // If rate limit is exceeded, return 429 Too Many Requests
    if (!success) {
        return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
                "Retry-After": Math.ceil(
                    (reset - Date.now()) / 1000,
                ).toString(),
            },
        });
    }

    // Continue with session handling if rate limit not exceeded
    const { response, user } = await updateSession(
        request,
        NextResponse.next(),
        {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
    );

    if (!request.nextUrl.pathname.endsWith("/login") && !user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add rate limit headers to all responses
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
