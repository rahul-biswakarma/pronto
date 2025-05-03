import { createSupabaseServerClient } from "@/supabase/utils/client/server";
import { supabaseOption } from "@/supabase/utils/config";
import { redirect } from "next/navigation";

export default async function DomainPage({
    params,
}: {
    params: { domain: string };
}) {
    const { domain } = params;
    const supabase = await createSupabaseServerClient(supabaseOption);

    // Check if the domain exists
    const { data: website, error } = await supabase
        .from("websites")
        .select("*")
        .eq("domain", domain)
        .single();

    if (error || !website) {
        // Redirect to home if domain doesn't exist
        redirect("/");
    }

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-4">Welcome to {domain}</h1>
            <p className="text-lg">
                Your website has been created successfully!
            </p>

            {/* You can add more content here based on the website data */}
            <div className="mt-8 p-4 bg-gray-100 rounded-md">
                <h2 className="text-xl font-semibold mb-2">Website Details</h2>
                <p>
                    <strong>Domain:</strong> {website.domain}
                </p>
                <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(website.created_at).toLocaleString()}
                </p>
                <p>
                    <strong>Published:</strong>{" "}
                    {website.is_published ? "Yes" : "No"}
                </p>
            </div>
        </div>
    );
}
