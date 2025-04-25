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

    const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolio")
        .select("domain, id")
        .eq("user_id", userId);

    if (portfolioError || !portfolioData) {
        redirect(ROUTES.Onboarding);
    }

    return <PortfolioSelector portfolioData={portfolioData} />;
};

export default OWXPage;
