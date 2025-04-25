import type { PageProps } from "@/.next/types/app/page";
import { EditorProvider } from "@/libs/components/editor/context/editor.context";
import { RouteProvider } from "@/libs/components/editor/context/route.context";
import { Editor } from "@/libs/components/editor/editor";
import { ROUTES } from "@/libs/constants/routes";
import { checkAuthentication } from "@/libs/utils/auth";
import { createDomainRouteMap } from "@/libs/utils/misc";
import { redirect } from "next/navigation";

const PortfolioEditorPage = async (props: PageProps) => {
    const params = await props.params;
    const domain = params.domain as string;

    const { authenticated, errorResponse, supabase, user } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/");
    }

    const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolio")
        .select("domain, id")
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

    const routeMap = await createDomainRouteMap(portfolioRoutes ?? []);

    const portfolioId = portfolioData?.id;

    return (
        <RouteProvider
            domain={domain}
            portfolioId={portfolioId}
            routeMap={routeMap}
        >
            <EditorProvider user={user} portfolioId={portfolioId}>
                <Editor />
            </EditorProvider>
        </RouteProvider>
    );
};

export default PortfolioEditorPage;
