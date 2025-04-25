import { Editor } from "@/libs/components/editor/editor";
import { EditorProvider } from "@/libs/components/editor/editor.context";
import { extractCssVariables } from "@/libs/components/editor/modes/theme-editor/utils";
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
    const portfolioRoutePath = routeMap["/"];

    if (portfolioRoutesError || !portfolioRoutePath) {
        redirect("/");
    }

    const htmlContent = (await getFileFromBucket(portfolioRoutePath)).data;

    // Extract CSS variables from style tags
    const html = htmlContent ?? "";
    const cssVariables: Record<string, string> = extractCssVariables(
        html,
    ).reduce(
        (acc, { name, value }) => {
            acc[name] = value;
            return acc;
        },
        {} as Record<string, string>,
    );

    // Flatten theme variables into dls
    const dls: Record<string, string> = Object.keys(cssVariables).reduce(
        (acc, key) => {
            acc[`theme.${key}`] = cssVariables[key];
            return acc;
        },
        {} as Record<string, string>,
    );

    return (
        <EditorProvider
            dls={dls}
            user={user}
            html={html}
            domain={domain}
            routes={routeMap}
            portfolioId={portfolioId}
            activeRoute={"/"}
        >
            <Editor />
        </EditorProvider>
    );
}
