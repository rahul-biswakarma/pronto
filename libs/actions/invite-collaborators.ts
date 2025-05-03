"use server";

import { checkAuthentication } from "@/libs/utils/auth";

/**
 * Invite collaborators to a website
 */
export async function inviteCollaborators({
    websiteId,
    emails,
}: {
    websiteId: string;
    emails: string[];
}) {
    try {
        const auth = await checkAuthentication();

        if (!auth.authenticated) {
            return {
                success: false,
                message: "Authentication required",
            };
        }

        const { userId, supabase } = auth;

        // Verify user has access to this website
        const { data: website, error: websiteError } = await supabase
            .from("websites")
            .select("id")
            .eq("id", websiteId)
            .eq("created_by", userId)
            .single();

        if (websiteError || !website) {
            return {
                success: false,
                message: "Website not found or you don't have permission",
            };
        }

        // Create invites
        const invites = emails.map((email) => ({
            website_id: websiteId,
            email,
            created_by: userId,
        }));

        const { error: inviteError } = await supabase
            .from("invites")
            .insert(invites);

        if (inviteError) throw inviteError;

        return {
            success: true,
            message: `Successfully invited ${emails.length} collaborator(s)`,
        };
    } catch (error) {
        console.error("Error inviting collaborators:", error);
        return {
            success: false,
            message: "Error inviting collaborators",
        };
    }
}
