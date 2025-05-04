import { CanvasProvider } from "@/libs/components/canvas/contexts/canvas.context";
import { RouteProvider } from "@/libs/components/canvas/contexts/route.context";
import Canvas from "@/libs/components/canvas/ui/canvas";
import { checkAuthentication } from "@/libs/utils/auth";
import { redirect } from "next/navigation";

export default async function DomainPage({
    params,
}: {
    params: { domain: string };
}) {
    const { domain } = params;
    const { authenticated, supabase } = await checkAuthentication();

    if (!authenticated) {
        // Redirect to login if not authenticated
        redirect("/login");
    }

    // Check if the domain exists
    const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("*")
        .eq("domain", domain)
        .single();

    if (websiteError || !website) {
        // Redirect to home if domain doesn't exist
        redirect("/");
    }

    // Fetch all routes for this website in the server component
    const { data: routes, error: routesError } = await supabase
        .from("routes")
        .select("*")
        .eq("website_id", website.id);

    if (routesError) {
        console.error("Error fetching routes:", routesError);
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="p-4 bg-white border-b">
                <h1 className="text-xl font-bold">Website: {domain}</h1>
            </header>

            <main className="flex-1 relative">
                <RouteProvider
                    domain={domain}
                    initialRoutes={routes || []}
                    initialWebsiteId={website.id}
                >
                    <CanvasProvider>
                        <Canvas />
                    </CanvasProvider>
                </RouteProvider>
            </main>
        </div>
    );
}
