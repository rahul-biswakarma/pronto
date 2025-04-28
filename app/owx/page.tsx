import { getWebsitePreviewHTML } from "@/libs/actions/website-actions";
import { PortfolioSelector } from "@/libs/components/selector/portfolio-selector";
import { ROUTES } from "@/libs/constants/routes";
import { checkAuthentication } from "@/libs/utils/auth";
import { redirect } from "next/navigation";

const OWXPage = async () => {
    const { authenticated, errorResponse, supabase, userId } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/login");
    }

    const { data: websitesData, error: websitesError } = await supabase
        .from("websites")
        .select("domain, id")
        .eq("user_id", userId);

    const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("html_file_path, path, website_id")
        .in("website_id", websitesData?.map((website) => website.id) ?? [])
        .eq("path", "/");

    // Join the routes with their corresponding website domains
    const routesWithDomains =
        routesData?.map((route) => {
            const website = websitesData?.find(
                (site) => site.id === route.website_id,
            );
            return {
                ...route,
                domain: website?.domain || "",
            };
        }) || [];

    const html_paths = await Promise.all(
        routesWithDomains.map(async (route) => {
            const result = await getWebsitePreviewHTML(
                route.html_file_path ?? "",
            );
            return {
                html: result.html ?? "",
                route: route.path,
                domain: route.domain,
            };
        }),
    );

    if (websitesError || !websitesData) {
        redirect(ROUTES.Onboarding);
    }

    if (websitesData.length === 0) {
        redirect(ROUTES.Onboarding);
    }

    if (websitesData.length === 1) {
        redirect(`/${websitesData[0].domain}`);
    }

    return (
        <div className="flex flex-col gap-y-4 p-8">
            <h1 className="text-3xl font-normal">Saved</h1>
            <PortfolioSelector data={html_paths} />
        </div>
    );
};

export default OWXPage;
