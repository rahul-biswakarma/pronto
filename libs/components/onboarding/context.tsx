"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import {
    checkDomainAvailability as checkDomain,
    createWebsite as createSite,
} from "./api";

type OnboardingState = {
    websiteName: string;
    domain: string;
    collaboratorEmails: string[];
    domainStatus: {
        checking: boolean;
        available: boolean | null;
        message: string | null;
    };
    isLoading: boolean;
    error: string | null;
};

type OnboardingContextType = {
    state: OnboardingState;
    setWebsiteName: (name: string) => void;
    setDomain: (domain: string) => void;
    addCollaborator: (email: string) => void;
    removeCollaborator: (email: string) => void;
    checkDomainAvailability: (domain: string) => Promise<void>;
    createWebsite: () => Promise<string | null>;
    setError: (error: string | null) => void;
};

const initialState: OnboardingState = {
    websiteName: "",
    domain: "",
    collaboratorEmails: [],
    domainStatus: {
        checking: false,
        available: null,
        message: null,
    },
    isLoading: false,
    error: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
    undefined,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OnboardingState>(initialState);

    const setWebsiteName = (name: string) => {
        setState((prev) => ({ ...prev, websiteName: name }));
    };

    const setDomain = (domain: string) => {
        // Format domain (lowercase, remove special characters)
        const formattedDomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setState((prev) => ({ ...prev, domain: formattedDomain }));

        // Check domain availability if it's long enough
        if (formattedDomain.length >= 3) {
            checkDomainAvailability(formattedDomain);
        } else {
            setState((prev) => ({
                ...prev,
                domainStatus: {
                    checking: false,
                    available: null,
                    message: null,
                },
            }));
        }
    };

    const addCollaborator = (email: string) => {
        if (!email) return;

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setState((prev) => ({
                ...prev,
                error: "Please enter a valid email address",
            }));
            return;
        }

        if (!state.collaboratorEmails.includes(email)) {
            setState((prev) => ({
                ...prev,
                collaboratorEmails: [...prev.collaboratorEmails, email],
                error: null,
            }));
        }
    };

    const removeCollaborator = (email: string) => {
        setState((prev) => ({
            ...prev,
            collaboratorEmails: prev.collaboratorEmails.filter(
                (e) => e !== email,
            ),
        }));
    };

    const setError = (error: string | null) => {
        setState((prev) => ({ ...prev, error }));
    };

    const checkDomainAvailability = async (domain: string) => {
        setState((prev) => ({
            ...prev,
            domainStatus: {
                checking: true,
                available: null,
                message: "Checking availability...",
            },
        }));

        try {
            const result = await checkDomain(domain);

            setState((prev) => ({
                ...prev,
                domainStatus: {
                    checking: false,
                    available: result.available,
                    message: result.message,
                },
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                domainStatus: {
                    checking: false,
                    available: false,
                    message: `Error checking domain. More details: ${error}`,
                },
            }));
        }
    };

    const createWebsite = async (): Promise<string | null> => {
        if (!state.websiteName || !state.domain) {
            setState((prev) => ({
                ...prev,
                error: "Website name and domain are required",
            }));
            return null;
        }

        if (state.domainStatus.available === false) {
            setState((prev) => ({
                ...prev,
                error: "Please choose an available domain",
            }));
            return null;
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await createSite({
                name: state.websiteName,
                domain: state.domain,
                collaboratorEmails: state.collaboratorEmails,
            });

            setState((prev) => ({ ...prev, isLoading: false }));

            if (result.success && result.websiteId) {
                return state.domain;
            }

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: result.message || "Failed to create website",
            }));
            return null;
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: "An unexpected error occurred",
            }));
            console.error(error);
            return null;
        }
    };

    return (
        <OnboardingContext.Provider
            value={{
                state,
                setWebsiteName,
                setDomain,
                addCollaborator,
                removeCollaborator,
                checkDomainAvailability,
                createWebsite,
                setError,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error(
            "useOnboarding must be used within an OnboardingProvider",
        );
    }
    return context;
}
