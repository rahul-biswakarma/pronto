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

interface PortfolioUploadResult {
    success: boolean;
    publicUrl?: string | null;
    error?: string;
    htmlPath?: string | null;
}

/**
 * Creates a secure admin client for server operations that require elevated privileges
 * @returns Supabase client with admin privileges
 */
export async function createSecureAdminClient() {
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

type uploadPortfolioFileInBucketProps = {
    content: string;
    filename: string;
    contentType: string;
};

export async function uploadFileInBucket({
    content,
    filename,
    contentType,
}: uploadPortfolioFileInBucketProps): Promise<PortfolioUploadResult> {
    const operationId = crypto.randomUUID();
    logger.info({ operationId, filename }, "Starting portfolio upload");

    try {
        // Create secure admin client
        const supabase = await createSecureAdminClient();

        // For server-side environments, use Buffer instead of Blob
        const htmlBuffer = Buffer.from(content);

        // Use the existing "portfolios" bucket
        const bucket = "portfolios";

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

        return {
            success: true,
            publicUrl: url,
            htmlPath: `${bucket}/${filename}`,
        };
    } catch (error) {
        logger.error(
            {
                operationId,
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

export async function getFileFromBucket(path: string): Promise<{
    data: string | null;
    error: Error | null;
}> {
    if (!path) {
        return { data: null, error: new Error("File path cannot be empty.") };
    }

    const supabase = await createSecureAdminClient();
    // Assume path might be like "portfolios/content-xyz.json"
    // We only need the part after the bucket name for download
    const objectPath = path.startsWith(`${BUCKET_NAME}/`)
        ? path.substring(BUCKET_NAME.length + 1)
        : path;

    logger.info(
        { objectPath },
        `Attempting to download from bucket ${BUCKET_NAME}`,
    );

    const { data: blob, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(objectPath);

    if (error) {
        logger.error(
            { path, objectPath, error: error.message },
            "Failed to download file from bucket",
        );
        return { data: null, error };
    }

    if (!blob) {
        logger.warn({ path, objectPath }, "File downloaded but blob is null");
        return { data: null, error: new Error("Downloaded file is empty.") };
    }

    try {
        const textContent = await blob.text();
        return { data: textContent, error: null };
    } catch (conversionError: unknown) {
        logger.error(
            {
                path,
                objectPath,
                error:
                    conversionError instanceof Error
                        ? conversionError.message
                        : String(conversionError),
            },
            "Failed to convert downloaded blob to text",
        );
        return {
            data: null,
            error: new Error("Failed to read file content."),
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
    const operationId = crypto.randomUUID();
    logger.info(
        { operationId, userId, publish },
        "Updating portfolio access permissions",
    );

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

        logger.debug(
            { operationId, userId },
            "Fetching current portfolio information",
        );
        // Get the current portfolio information
        const { data: portfolioData, error: fetchError } = await supabase
            .from("resume_summaries")
            .select("portfolio_s3_path, portfolio_html")
            .eq("user_id", userId)
            .single();

        if (fetchError || !portfolioData?.portfolio_s3_path) {
            logger.error(
                {
                    operationId,
                    userId,
                    error: fetchError?.message,
                },
                "Portfolio not found for access update",
            );

            return {
                success: false,
                error: "Portfolio not found",
            };
        }

        const bucket = "portfolios";
        const filename = `portfolio-${userId}.html`;

        logger.debug(
            { operationId, userId, publish },
            "Generating appropriate URL for portfolio",
        );
        // Just update the public status without moving files
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        let url = urlData.publicUrl;

        // Generate a signed URL if it's not supposed to be public
        if (!publish) {
            logger.debug(
                { operationId, userId },
                "Creating signed URL for private portfolio",
            );
            const { data: signedData } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filename, 60 * 60 * 24 * 7); // 7 day expiry

            url = signedData?.signedUrl || url;
        }

        logger.debug(
            { operationId, userId },
            "Updating database record with new access settings",
        );
        // Update database record
        const { error: updateError } = await supabase
            .from("resume_summaries")
            .update({
                portfolio_s3_path: `${bucket}/${filename}`,
                portfolio_public: publish,
                portfolio_url: url,
                portfolio_updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        if (updateError) {
            logger.error(
                {
                    operationId,
                    userId,
                    error: updateError.message,
                },
                "Failed to update portfolio access in database",
            );
        }

        logger.info(
            {
                operationId,
                userId,
                publish,
                success: true,
            },
            "Portfolio access updated successfully",
        );

        return {
            success: true,
            publicUrl: publish ? url : null,
        };
    } catch (error) {
        logger.error(
            {
                operationId,
                userId,
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
            },
            "Error updating portfolio access",
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

export const getFileUrlFromBucket = async (path: string) => {
    const supabase = await createSecureAdminClient();

    const objectPath = path.startsWith(`${BUCKET_NAME}/`)
        ? path.substring(BUCKET_NAME.length + 1)
        : path;

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(objectPath);

    return urlData.publicUrl;
};

export const updateFileInBucket = async (path: string, content: string) => {
    const supabase = await createSecureAdminClient();
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, content);

    return error;
};
