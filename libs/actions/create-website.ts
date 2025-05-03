"use server";

import { checkAuthentication } from "@/libs/utils/auth";

/**
 * Create a new website with domain and collaborators
 */
export async function createWebsite({
    name,
    domain,
    collaboratorEmails,
}: {
    name: string;
    domain: string;
    collaboratorEmails: string[];
}) {
    try {
        const auth = await checkAuthentication();

        if (!auth.authenticated) {
            return {
                success: false,
                message: "Authentication required",
                websiteId: null,
            };
        }

        const { userId, supabase } = auth;

        // Start a transaction
        const { data: websiteData, error: websiteError } = await supabase
            .from("websites")
            .insert({
                domain,
                name,
                created_by: userId,
                updated_by: userId,
                is_first_visit: true,
            })
            .select()
            .single();

        if (websiteError) throw websiteError;

        // Create a default route for the website
        await supabase.from("routes").insert({
            website_id: websiteData.id,
            path: "/",
            created_by: userId,
            updated_by: userId,
        });

        // Add collaborators if provided
        if (collaboratorEmails.length > 0) {
            const invites = collaboratorEmails.map((email) => ({
                website_id: websiteData.id,
                email,
                created_by: userId,
            }));

            await supabase.from("invites").insert(invites);
        }

        return {
            success: true,
            message: "Website created successfully",
            websiteId: websiteData.id,
        };
    } catch (error) {
        console.error("Error creating website:", error);
        return {
            success: false,
            message: "Error creating website",
            websiteId: null,
        };
    }
}
