import { OnboardingMain } from "@/libs/components/onboarding/onboarding-main";
import { OnboardingProvider } from "@/libs/components/onboarding/onboarding.context";

export default function OnboardingPage() {
    return (
        <OnboardingProvider>
            <OnboardingMain />
        </OnboardingProvider>
    );
}
