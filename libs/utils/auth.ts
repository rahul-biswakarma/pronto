"use server";

import { createSupabaseServerClient } from "@/supabase/utils/client/server";
import { supabaseOption } from "@/supabase/utils/config";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthResult =
    | {
        authenticated: false;
        errorResponse: Response;
        supabase?: never;
        userId?: never;
        user?: never;
    }
    | {
        authenticated: true;
        userId: string;
        supabase: SupabaseClient;
        user: User;
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
        user: data.user,
    };
}
