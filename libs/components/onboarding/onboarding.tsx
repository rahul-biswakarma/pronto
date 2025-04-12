import { OnboardingProvider } from "./onboarding-context";

const Onboarding = () => {
    return <div>Onboarding</div>;
};

const OnboardingWrapper = () => {
    return (
        <OnboardingProvider>
            <Onboarding />
        </OnboardingProvider>
    );
};

export { OnboardingWrapper as Onboarding };
