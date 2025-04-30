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

    const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolio")
        .select("domain, id, theme_variables")
        .eq("domain", domain)
        .single();

    if (portfolioError) {
        redirect(ROUTES.SelectPortfolio);
    }

    const { data: portfolioRoutes, error: portfolioRoutesError } =
        await supabase
            .from("portfolio_route_map")
            .select("*")
            .eq("domain", domain);

    if (portfolioError || portfolioRoutesError) {
        redirect(ROUTES.SelectPortfolio);
    }

    const portfolioId = portfolioData?.id;
    const themeVariables = portfolioData?.theme_variables;
    const routeMap = await createDomainRouteMap(portfolioRoutes ?? []);

    return (
        <RouteProvider
            domain={domain}
            portfolioId={portfolioId}
            routeMap={routeMap}
        >
            <EditorProvider
                dls={{ theme: themeVariables }}
                user={user}
                portfolioId={portfolioId}
            >
                <Editor />
            </EditorProvider>
        </RouteProvider>
    );
};

export default PortfolioEditorPage;
