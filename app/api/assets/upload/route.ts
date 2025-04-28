import { checkAuthentication } from "@/libs/utils/auth";
import { createSecureAdminClient } from "@/libs/utils/supabase-storage";
import { type NextRequest, NextResponse } from "next/server";

const ASSETS_BUCKET = "assets";

export async function POST(request: NextRequest) {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = auth.supabase;
    const userId = auth.userId;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "File is required", success: false },
                { status: 400 },
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Only image files are allowed", success: false },
                { status: 400 },
            );
        }

        // Get portfolio ID for the user
        const { data: portfolioData, error: portfolioError } = await supabase
            .from("portfolio")
            .select("id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (portfolioError) {
            return NextResponse.json(
                { error: "No portfolio found", success: false },
                { status: 400 },
            );
        }

        const portfolioId = portfolioData.id;

        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop();
        const uniqueFilename = `${userId}_${timestamp}.${fileExtension}`;
        const fullPath = `${portfolioId}/${uniqueFilename}`;

        // Convert file to buffer for server-side upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use admin client to upload to storage
        const adminClient = await createSecureAdminClient();

        // Check if the assets bucket exists, if not create it
        const { data: buckets } = await adminClient.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === ASSETS_BUCKET);

        if (!bucketExists) {
            await adminClient.storage.createBucket(ASSETS_BUCKET, {
                public: true,
            });
        }

        // Upload file to Supabase Storage
        const { error: uploadError } = await adminClient.storage
            .from(ASSETS_BUCKET)
            .upload(fullPath, buffer, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get the public URL
        const { data: urlData } = adminClient.storage
            .from(ASSETS_BUCKET)
            .getPublicUrl(fullPath);

        const url = urlData.publicUrl;

        // Record in database
        const { data: assetData, error: insertError } = await supabase
            .from("portfolio_assets")
            .insert({
                user_id: userId,
                portfolio_id: portfolioId,
                filename: file.name,
                content_type: file.type,
                size: file.size,
                storage_path: `${ASSETS_BUCKET}/${fullPath}`,
                url,
            })
            .select("*")
            .single();

        if (insertError) {
            throw new Error(`Failed to record asset: ${insertError.message}`);
        }

        return NextResponse.json({
            success: true,
            asset: assetData,
        });
    } catch (error) {
        console.error("Asset upload failed:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                success: false,
            },
            { status: 500 },
        );
    }
}
