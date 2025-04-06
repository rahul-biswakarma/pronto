import type { SupabaseClient } from "@supabase/supabase-js";

export const getAuthUserQuery = async ({
    supabase,
}: { supabase: SupabaseClient }) => {
    try {
        const response = await supabase.auth.getUser();
        return response;
    } catch (error) {
        console.error(error);
    }
};

export const verifyAuthUser = async ({
    supabase,
}: { supabase: SupabaseClient }) => {
    const authUser = await getAuthUserQuery({
        supabase,
    });

    if (!authUser) throw new Error("User not found");

    const {
        data: { user },
        error: authError,
    } = authUser;

    if (authError || !user) throw authError;
};
