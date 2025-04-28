import { checkAuthentication } from "@/libs/utils/auth";
import { createSecureAdminClient } from "@/libs/utils/supabase-storage";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { assetId: string } },
) {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = auth.supabase;
    const userId = auth.userId;
    const assetId = params.assetId;

    try {
        // Fetch the asset to get its storage path
        const { data: asset, error: fetchError } = await supabase
            .from("portfolio_assets")
            .select("storage_path")
            .eq("id", assetId)
            .eq("user_id", userId)
            .single();

        if (fetchError || !asset) {
            return NextResponse.json(
                { error: "Asset not found", success: false },
                { status: 404 },
            );
        }

        // Delete from storage bucket
        const adminClient = await createSecureAdminClient();
        const storagePath = asset.storage_path;

        // Extract bucket name and path
        const [bucketName, ...pathParts] = storagePath.split("/");
        const objectPath = pathParts.join("/");

        // Delete the file from storage
        const { error: storageError } = await adminClient.storage
            .from(bucketName)
            .remove([objectPath]);

        if (storageError) {
            console.error("Error deleting from storage:", storageError);
            // Continue with database deletion even if storage delete fails
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from("portfolio_assets")
            .delete()
            .eq("id", assetId)
            .eq("user_id", userId);

        if (deleteError) {
            throw new Error(
                `Failed to delete asset record: ${deleteError.message}`,
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete asset:", error);
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
