import { createSupabaseServerClient } from "@/supabase/client/server";
import { supabaseOption } from "@/supabase/config";
import { verifyAuthUser } from "@/supabase/utils";

export const runtime = "edge";

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient(supabaseOption);
        await verifyAuthUser({ supabase });

        // Get the authenticated user
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Fetch user's summaries
        const { data, error } = await supabase
            .from("resume_summaries")
            .select("id, created_at, summary, skills, persona, personality")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("Database error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to fetch resume summaries";

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
