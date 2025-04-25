import { createSupabaseServerClient } from "@/libs/supabase/client/server";
import { supabaseOption } from "@/libs/supabase/config";
import { getFileUrlFromBucket } from "@/libs/utils/supabase-storage";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ subdomain: string[] }> },
) {
    const params = await context.params;
    const { subdomain } = params;

    try {
        const supabase = await createSupabaseServerClient(supabaseOption);

        const domain = subdomain[0];
        const routes = subdomain?.slice(1)?.join("/");

        const path = routes.length > 0 ? `${routes}` : "/";

        if (!subdomain) {
            console.error("No subdomain provided");
            return new NextResponse("Subdomain is required", { status: 400 });
        }

        // Get the portfolio data for the subdomain
        const { data, error } = await supabase
            .from("portfolio_route_map")
            .select("*")
            .eq("domain", domain)
            .eq("route", path)
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return new NextResponse("Database error", { status: 500 });
        }

        if (!data) {
            console.error("No portfolio found for subdomain:", subdomain);
            return new NextResponse("Portfolio not found", { status: 404 });
        }

        // Get the HTML content from S3
        const htmlUrl = await getFileUrlFromBucket(data.html_s3_path);

        // Fetch the HTML content
        const response = await fetch(htmlUrl);
        if (!response.ok) {
            console.error(
                "Failed to fetch HTML:",
                response.status,
                response.statusText,
            );
            return new NextResponse("Failed to fetch portfolio content", {
                status: 500,
            });
        }

        const html = await response.text();

        // Return the HTML with appropriate headers
        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (error) {
        console.error("Error serving preview:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
