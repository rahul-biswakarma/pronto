import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./supabase/middleware";

export async function middleware(request: NextRequest) {
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

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
