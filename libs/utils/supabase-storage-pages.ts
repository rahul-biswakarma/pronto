"use server";
import { createClient } from "@supabase/supabase-js";
import logger from "./logger";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET_NAME = "portfolios"; // Define bucket name centrally

// Prevent service role key from being exposed
if (!SERVICE_ROLE_KEY && process.env.NODE_ENV === "production") {
    logger.error("Missing SUPABASE_SERVICE_ROLE_KEY in production environment");
}

/**
 * Creates a secure admin client for server operations that require elevated privileges
 * @returns Supabase client with admin privileges
 */
function createSecureAdminClient() {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase configuration for admin operations");
    }

    return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

interface PortfolioUploadResult {
    success: boolean;
    publicUrl?: string | null;
    error?: string;
}

type uploadPortfolioFileInBucketProps = {
    pageId: string;
    portfolioId: string;
    content: string;
    filename: string;
    contentType: string;
    dbColKeyPrefix: "html" | "content"; // DANGER: This is based on DB column names
    domain: string;
};

export async function uploadPortfolioFileInBucket({
    pageId,
    portfolioId,
    content,
    filename,
    contentType,
    domain,
}: uploadPortfolioFileInBucketProps): Promise<PortfolioUploadResult> {
    const operationId = crypto.randomUUID();
    logger.info({ operationId, filename }, "Starting portfolio upload");

    try {
        // Create secure admin client
        const supabase = createSecureAdminClient();

        // For server-side environments, use Buffer instead of Blob
        const htmlBuffer = Buffer.from(content);

        // Use the existing "portfolios" bucket
        const bucket = BUCKET_NAME;

        // Upload the file
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filename, htmlBuffer, {
                cacheControl: "3600", // 1 hour
                upsert: true,
                contentType,
            });

        if (error) {
            logger.error(
                { operationId, filename, error: error.message },
                "Failed to upload portfolio to storage",
            );
            return { success: false, error: error.message };
        }

        // Get the URL to the uploaded file
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        const url = urlData.publicUrl;

        // Store the reference in the database to link it to the user
        // const { error: updateError } = await supabase
        //     .from("portfolio")
        //     .update({
        //         [`${dbColKeyPrefix}_s3_path`]: `${bucket}/${filename}`,
        //     })
        //     .eq("id", portfolioId);

        const { error: createError } = await supabase
            .from("portfolio_route_map")
            .insert({
                domain: domain,
                route: pageId,
                html_s3_path: `${bucket}/${filename}`,
            })
            .select("id")
            .single();

        if (createError) {
            logger.error(
                {
                    operationId,
                    portfolioId,
                    error: createError.message,
                },
                "Database update failed after portfolio upload",
            );
        }

        return {
            success: true,
            publicUrl: url,
        };
    } catch (error) {
        logger.error(
            {
                operationId,
                portfolioId,
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
            },
            "Error during portfolio upload",
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}
