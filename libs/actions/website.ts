"use server";

import { checkAuthentication } from "@/libs/utils/auth";
import { createSupabaseServerClient } from "@/supabase/utils/client/server";
import { supabaseOption } from "@/supabase/utils/config";

/**
 * Check if a domain is available
 */
export async function checkDomainAvailability(domain: string) {
    try {
        const supabase = await createSupabaseServerClient(supabaseOption);

        // Check if domain exists in websites table
        const { data: websiteData, error: websiteError } = await supabase
            .from("websites")
            .select("id")
            .eq("domain", domain)
            .maybeSingle();

        if (websiteError) throw websiteError;

        // Check if domain exists in domains table
        const { data: domainData, error: domainError } = await supabase
            .from("domains")
            .select("id")
            .eq("domain", domain)
            .maybeSingle();

        if (domainError) throw domainError;

        // Domain is available if it doesn't exist in either table
        return {
            available: !websiteData && !domainData,
            message:
                !websiteData && !domainData
                    ? "Domain is available"
                    : "Domain is already taken",
        };
    } catch (error) {
        console.error("Error checking domain availability:", error);
        return {
            available: false,
            message: "Error checking domain availability",
        };
    }
}

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
                name: name,
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
