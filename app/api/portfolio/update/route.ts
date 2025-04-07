import { checkAuthentication } from "@/utils/auth";
import { uploadPortfolio } from "@/utils/supabase-storage";

export async function POST(req: Request) {
    try {
        // Check authentication
        const auth = await checkAuthentication();
        if (!auth.authenticated) {
            return auth.errorResponse;
        }

        const userId = auth.userId;
        const supabase = auth.supabase;

        // Get the HTML from the request body
        const { html } = await req.json();

        if (!html) {
            return new Response(
                JSON.stringify({ error: "HTML content is required" }),
                { status: 400 },
            );
        }

        // Get the current portfolio settings
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("portfolio_public")
            .eq("user_id", userId)
            .single();

        if (fetchError) {
            return new Response(
                JSON.stringify({ error: "Failed to fetch portfolio settings" }),
                { status: 500 },
            );
        }

        // Preserve the public/private status
        const isPublic = portfolioData?.portfolio_public || false;

        // Update the portfolio HTML in storage and the database
        const uploadResult = await uploadPortfolio(userId, html, isPublic);

        if (!uploadResult.success) {
            return new Response(
                JSON.stringify({
                    error: uploadResult.error || "Failed to update portfolio",
                }),
                { status: 500 },
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                url: uploadResult.publicUrl || uploadResult.url,
                isPublic,
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
