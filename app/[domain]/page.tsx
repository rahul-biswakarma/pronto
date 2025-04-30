import { EditorProvider } from "@/libs/components/editor/context/editor.context";
import { RouteProvider } from "@/libs/components/editor/context/route.context";
import { Editor } from "@/libs/components/editor/editor";
import { ROUTES } from "@/libs/constants/routes";
import { checkAuthentication } from "@/libs/utils/auth";
import { createDomainRouteMap } from "@/libs/utils/misc";
import { redirect } from "next/navigation";

const PortfolioEditorPage = async ({
    params,
}: {
    params: { domain: string };
}) => {
    const { domain } = await params;

    const { authenticated, errorResponse, supabase, user } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/");
    }

    const { data: websiteData, error: websiteError } = await supabase
        .from("websites")
        .select("id, domain, is_first_visit")
        .eq("domain", domain)
        .single();

    if (websiteError) {
        redirect(ROUTES.SelectPortfolio);
    }

    const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("id, path, html_file_path")
        .eq("website_id", websiteData.id);

    if (websiteError || routesError) {
        redirect(ROUTES.SelectPortfolio);
    }

    if (websiteData.is_first_visit) {
        redirect(ROUTES.SelectPortfolio);
    }
    const websiteId = websiteData?.id;
    const routeMap = await createDomainRouteMap(routesData ?? []);

    return (
        <RouteProvider
            domain={domain}
            portfolioId={websiteId}
            routeMap={routeMap}
        >
            <EditorProvider
                dls={{ theme: {} }} // Theme variables are no longer stored in the database
                user={user}
                portfolioId={websiteId}
            >
                <Editor />
            </EditorProvider>
        </RouteProvider>
    );
};

export default PortfolioEditorPage;
