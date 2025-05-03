"use client";

import { OnboardingProvider } from "@/libs/components/onboarding/context";
import { OnboardingForm } from "@/libs/components/onboarding/onboarding-form";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Create Your Website</h1>
                    <p className="mt-2 text-gray-600">
                        Let's get started with your new website
                    </p>
                </div>

                <OnboardingProvider>
                    <OnboardingForm />
                </OnboardingProvider>
            </div>
        </div>
    );
}
