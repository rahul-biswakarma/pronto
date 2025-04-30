import { PortfolioSelector } from "@/libs/components/selector/portfolio-selector";
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

    console.log(websitesData);

    // if (websitesError || !websitesData) {
    //     redirect(ROUTES.Onboarding);
    // }

    // if (websitesData.length === 0) {
    //     redirect(ROUTES.Onboarding);
    // }

    // if (websitesData.length === 1) {
    //     redirect(`/${websitesData[0].domain}`);
    // }

    if (websitesError || !websitesData || websitesData.length === 0) {
        return <div>No Data</div>;
    }

    return (
        <div className="flex flex-col gap-y-4 p-8">
            <h1 className="text-3xl font-normal">Saved</h1>
            <PortfolioSelector
                domains={websitesData.map((web) => web.domain as string)}
            />
        </div>
    );
};

export default OWXPage;
