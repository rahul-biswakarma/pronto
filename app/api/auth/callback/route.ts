import logger from "@/libs/utils/logger";
import { createSupabaseServerClient } from "@/supabase/utils/client/server";
import { supabaseOption } from "@/supabase/utils/config";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    logger.info({ path: "auth/callback", next }, "Auth callback initiated");

    if (code) {
        const supabase = await createSupabaseServerClient(supabaseOption);
        logger.debug("Exchanging code for session");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            logger.info(
                {
                    forwardedHost,
                    isLocalEnv,
                    next,
                },
                "Auth successful, redirecting",
            );

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            }
            if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            }
            return NextResponse.redirect(`${origin}${next}`);
        }

        logger.error({ error }, "Failed to exchange code for session");
    } else {
        logger.warn("No code parameter provided in auth callback");
    }

    logger.error("Auth error, redirecting to error page");
    return NextResponse.redirect(`${origin}?error=auth-code-error`);
}
