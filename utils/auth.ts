"use server";

import { createSupabaseServerClient } from "@/supabase/client/server";
import { supabaseOption } from "@/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import logger from "./logger";

type AuthResult =
    | {
          authenticated: false;
          errorResponse: Response;
          supabase?: never;
          userId?: never;
      }
    | {
          authenticated: true;
          userId: string;
          supabase: SupabaseClient;
          errorResponse?: never;
      };

/**
 * Checks if the user is authenticated and returns the user ID.
 * @returns Object containing userId if authenticated, or error response if not
 */
export async function checkAuthentication(): Promise<AuthResult> {
    logger.debug("Checking user authentication");
    const supabase = await createSupabaseServerClient(supabaseOption);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        logger.warn({ error: error?.message }, "Authentication failed");
        return {
            authenticated: false,
            errorResponse: new Response(
                JSON.stringify({ error: "Authentication required" }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                },
            ),
        };
    }

    logger.debug({ userId: data.user.id }, "User authenticated successfully");
    return {
        authenticated: true,
        userId: data.user.id,
        supabase: supabase,
    };
}
