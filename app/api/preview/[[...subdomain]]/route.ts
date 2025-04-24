import { createSupabaseServerClient } from "@/libs/supabase/client/server";
import { supabaseOption } from "@/libs/supabase/config";
import { getFileUrlFromBucket } from "@/libs/utils/supabase-storage";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { subdomain: string[] } },
) {
    try {
        const { subdomain } = await params;
        const supabase = await createSupabaseServerClient(supabaseOption);

        const domain = subdomain[0];
        const path = subdomain.slice(1).join("/") ?? "home";

        if (!subdomain) {
            console.error("No subdomain provided");
            return new NextResponse("Subdomain is required", { status: 400 });
        }

        // Get the portfolio data for the subdomain
        const { data, error } = path
            ? await supabase
                  .from("portfolio_route_map")
                  .select("*")
                  .eq("domain", domain)
                  .eq("route", path)
                  .single()
            : await supabase
                  .from("portfolio_route_map")
                  .select("*")
                  .eq("domain", domain)
                  .single();

        if (error) {
            console.error("Supabase error:", error);
            return new NextResponse("Database error", { status: 500 });
        }

        if (!data) {
            console.error("No portfolio found for subdomain:", subdomain);
            return new NextResponse("Portfolio not found", { status: 404 });
        }

        console.log("Data:", data);
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
