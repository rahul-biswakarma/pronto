import { Editor } from "@/libs/components/editor/editor";
import { EditorProvider } from "@/libs/components/editor/editor.context";
import { checkAuthentication } from "@/libs/utils/auth";
import { createDomainRouteMap } from "@/libs/utils/misc";
import { getFileFromBucket } from "@/libs/utils/supabase-storage";
import { redirect } from "next/navigation";

export default async function Page() {
    const { authenticated, errorResponse, supabase, userId, user } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/");
    }

    // Fetch user's portfolio data
    const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolio")
        .select("domain, id")
        .eq("user_id", userId)
        .single();

    const domain = portfolioData?.domain;
    const portfolioId = portfolioData?.id;

    if (portfolioError) {
        console.error("Error fetching portfolio:", portfolioError);
        redirect("/");
    }

    const { data: portfolioRoutes, error: portfolioRoutesError } =
        await supabase
            .from("portfolio_route_map")
            .select("*")
            .eq("domain", domain);

    const routeMap = await createDomainRouteMap(portfolioRoutes ?? []);
    const portfolioRoute = routeMap["/"];

    if (portfolioRoutesError || !portfolioRoute) {
        redirect("/");
    }

    const htmlContent = (await getFileFromBucket(portfolioRoute)).data;
    const cssVars: Record<string, string> = {};

    // Extract CSS variables from style tags
    const styleMatch = htmlContent?.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
        const varRegex = /--[\w-]+:\s*[^;]+/g;
        for (const style of styleMatch) {
            const vars = style.match(varRegex);
            if (vars) {
                for (const v of vars) {
                    const [key, value] = v.split(":").map((s) => s.trim());
                    cssVars[key] = value;
                }
            }
        }
    }

    const html = htmlContent ?? "";

    // Flatten theme variables into dls
    const dls: Record<string, string> = {
        ...Object.entries(cssVars).reduce(
            (acc, [key, value]) => {
                acc[`theme.${key}`] = value;
                return acc;
            },
            {} as Record<string, string>,
        ),
    };

    return (
        <EditorProvider
            dls={dls}
            user={user}
            html={html}
            domain={domain}
            routes={routeMap}
            portfolioId={portfolioId}
            activeRoute={portfolioRoute}
        >
            <Editor />
        </EditorProvider>
    );
}
