import { OnboardingMain } from "@/libs/components/onboarding/onboarding-main";
import { OnboardingProvider } from "@/libs/components/onboarding/onboarding.context";
import { checkAuthentication } from "@/libs/utils/auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    const { authenticated, errorResponse } = await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/login");
    }

    return (
        <OnboardingProvider>
            <OnboardingMain />
        </OnboardingProvider>
    );
}
