import { getWebsitePreviewHTML } from "@/libs/actions/website-actions";
import { InfiniteCanvas } from "@/libs/components/canvas/canvas-preview";
import { checkAuthentication } from "@/libs/utils/auth";
import { redirect } from "next/navigation";

const CanvasPage = async () => {
    const domains = ["mv0pdh", "yiwrh9"];

    const { authenticated, errorResponse, supabase, user } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/login");
    }
    const { data: websitesData, error: websitesError } = await supabase
        .from("websites")
        .select("id, domain, is_first_visit")
        .in("domain", domains);

    if (websitesError) {
        redirect("/login");
    }

    const websiteIds = websitesData.map((website) => website.id);

    const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("id, path, html_file_path")
        .in("website_id", websiteIds);

    const results = await Promise.all(
        routesData?.map(async (route) => {
            return await getWebsitePreviewHTML(route.html_file_path);
        }) ?? [],
    );

    const frames = results.map((result) => ({
        html: result.html ?? "",
    }));

    return (
        <div>
            <InfiniteCanvas frames={frames} />
        </div>
    );
};

export default CanvasPage;
