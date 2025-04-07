import { checkAuthentication } from "@/utils/auth";

export async function GET() {
    try {
        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const userId = auth.userId;
        const supabase = auth.supabase;

        // Get the portfolio HTML from the database
        const { data, error } = await supabase
            .from("resume_summaries")
            .select("portfolio_html, portfolio_url, portfolio_public")
            .eq("user_id", userId)
            .single();

        if (error) {
            return new Response(
                JSON.stringify({ error: "Failed to fetch portfolio data" }),
                { status: 500 },
            );
        }

        return new Response(
            JSON.stringify({
                html: data.portfolio_html || "",
                url: data.portfolio_url || null,
                isPublic: data.portfolio_public || false,
            }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
            }),
            { status: 500 },
        );
    }
}
