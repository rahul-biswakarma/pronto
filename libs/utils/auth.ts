"use server";

import { createSupabaseServerClient } from "@/libs/supabase/client/server";
import { supabaseOption } from "@/libs/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";

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
    const supabase = await createSupabaseServerClient(supabaseOption);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
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

    return {
        authenticated: true,
        userId: data.user.id,
        supabase: supabase,
    };
}
