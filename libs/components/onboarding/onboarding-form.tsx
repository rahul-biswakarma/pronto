"use client";

import { useRouter } from "next/navigation";
import { CollaboratorInput } from "./collaborator-input";
import { useOnboarding } from "./context";
import { DomainInput } from "./domain-input";
import { ErrorDisplay } from "./error-display";
import { SubmitButton } from "./submit-button";
import { WebsiteNameInput } from "./website-name-input";

export function OnboardingForm() {
    const router = useRouter();
    const { createWebsite } = useOnboarding();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const domain = await createWebsite();
        if (domain) {
            router.push(`/${domain}`);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <ErrorDisplay />

            <div className="space-y-4">
                <WebsiteNameInput />
                <DomainInput />
                <CollaboratorInput />
            </div>

            <div>
                <SubmitButton />
            </div>
        </form>
    );
}
