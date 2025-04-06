"use server";
import { createClient } from "@supabase/supabase-js";

interface PortfolioUploadResult {
    success: boolean;
    url?: string | null;
    publicUrl?: string | null;
    error?: string;
}

/**
 * Uploads a portfolio HTML file to Supabase Storage
 * @param userId The user ID to associate with the portfolio
 * @param html The HTML content of the portfolio
 * @param publish Whether to make the portfolio publicly accessible
 * @returns Upload result with URLs if successful
 */
export async function uploadPortfolio(
    userId: string,
    html: string,
    publish = false,
): Promise<PortfolioUploadResult> {
    try {
        // Create Supabase client with service role key to bypass RLS policies
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            {
                auth: {
                    persistSession: false,
                },
            },
        );

        // For server-side environments, use Buffer instead of Blob
        const htmlBuffer = Buffer.from(html);

        const filename = `portfolio-${userId}.html`;

        // Use the existing "portfolios" bucket
        const bucket = "portfolios";

        // Upload the file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filename, htmlBuffer, {
                cacheControl: "3600",
                upsert: true,
                contentType: "text/html",
            });

        if (error) {
            return { success: false, error: error.message };
        }

        // Get the URL to the uploaded file
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        let url = urlData.publicUrl;

        // For private files, get a signed URL
        if (!publish) {
            const { data: signedData } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filename, 60 * 60 * 24 * 7); // 7 day expiry

            url = signedData?.signedUrl || url;
        }

        // Store the reference in the database to link it to the user
        await supabase
            .from("resume_summaries")
            .update({
                portfolio_s3_path: `${bucket}/${filename}`,
                portfolio_public: publish,
                portfolio_url: url,
                portfolio_updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        return {
            success: true,
            url: !publish ? url : null,
            publicUrl: publish ? url : null,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Makes an existing portfolio public or private
 * @param userId The user ID associated with the portfolio
 * @param publish Whether to make the portfolio publicly accessible
 * @returns Update result
 */
export async function updatePortfolioAccess(
    userId: string,
    publish: boolean,
): Promise<PortfolioUploadResult> {
    try {
        // Create Supabase client with service role key to bypass RLS policies
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            {
                auth: {
                    persistSession: false,
                },
            },
        );

        // Get the current portfolio information
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("portfolio_s3_path, portfolio_html")
            .eq("user_id", userId)
            .single();

        if (fetchError || !portfolioData?.portfolio_s3_path) {
            return {
                success: false,
                error: "Portfolio not found",
            };
        }

        const bucket = "portfolios";
        const filename = `portfolio-${userId}.html`;

        // Just update the public status without moving files
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        let url = urlData.publicUrl;

        // Generate a signed URL if it's not supposed to be public
        if (!publish) {
            const { data: signedData } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filename, 60 * 60 * 24 * 7); // 7 day expiry

            url = signedData?.signedUrl || url;
        }

        // Update database record
        await supabase
            .from("resume_summaries")
            .update({
                portfolio_s3_path: `${bucket}/${filename}`,
                portfolio_public: publish,
                portfolio_url: url,
                portfolio_updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        return {
            success: true,
            url: !publish ? url : null,
            publicUrl: publish ? url : null,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}
