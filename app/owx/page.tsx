import { PortfolioSelector } from "@/libs/components/selector/portfolio-selector";
import { ROUTES } from "@/libs/constants/routes";
import { checkAuthentication } from "@/libs/utils/auth";
import { getFileFromBucket } from "@/libs/utils/supabase-storage";
import { redirect } from "next/navigation";

const OWXPage = async () => {
    const { authenticated, errorResponse, supabase, userId } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/login");
    }

    const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolio")
        .select("domain, id")
        .eq("user_id", userId);

    const { data: portfolioRouteMapData, error: portfolioRouteMapError } =
        await supabase
            .from("portfolio_route_map")
            .select("html_s3_path, route, domain")
            .in(
                "portfolio_id",
                portfolioData?.map((portfolio) => portfolio.id) ?? [],
            )
            .eq("route", "/");

    const html_paths = await Promise.all(
        (portfolioRouteMapData ?? []).map(async (route) => {
            const html = await getFileFromBucket(route.html_s3_path ?? "");
            return {
                html: html.data ?? "",
                route: route.route,
                domain: route.domain,
            };
        }),
    );

    if (portfolioError || !portfolioData) {
        redirect(ROUTES.Onboarding);
    }

    if (portfolioData.length === 0) {
        redirect(ROUTES.Onboarding);
    }

    if (portfolioData.length === 1) {
        redirect(`/${portfolioData[0].domain}`);
    }

    return (
        <div className="flex flex-col gap-y-4 p-8">
            <h1 className="text-3xl font-normal">Saved</h1>
            <PortfolioSelector data={html_paths} />
        </div>
    );
};

export default OWXPage;
