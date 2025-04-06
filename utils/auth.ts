"use server";

import { createSupabaseServerClient } from "@/supabase/client/server";
import { supabaseOption } from "@/supabase/config";
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
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
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
        userId: session.user.id,
        supabase: supabase,
    };
}
