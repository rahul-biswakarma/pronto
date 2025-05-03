"use client";

import debounce from "lodash/debounce";
import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    checkDomainAvailability as checkDomain,
    createWebsite as createSite,
} from "./api";
import type { OnboardingContextType, OnboardingState } from "./types";
import { formatDomain, isDomainValid } from "./utils/domain-validator";
import { isEmailValid } from "./utils/email-validator";
import {
    resetDomainStatus,
    setDomainCheckingState,
    updateDomainStatus,
} from "./utils/state-handlers";

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

    const checkDomainAvailability = useCallback(async (domain: string) => {
        setState((prev) => setDomainCheckingState(prev));

        try {
            const result = await checkDomain(domain);
            setState((prev) =>
                updateDomainStatus(prev, result.available, result.message),
            );
        } catch (error) {
            setState((prev) =>
                updateDomainStatus(
                    prev,
                    false,
                    `Error checking domain: ${error}`,
                ),
            );
        }
    }, []);

    // Create debounced domain check function with proper reference
    const debouncedDomainCheckRef = useRef(
        debounce((domain: string) => checkDomainAvailability(domain), 500),
    );

    // Clean up the debounce on unmount
    useEffect(() => {
        return () => {
            debouncedDomainCheckRef.current.cancel();
        };
    }, []);

    const setDomain = (domain: string) => {
        // Format domain
        const formattedDomain = formatDomain(domain);
        setState((prev) => ({ ...prev, domain: formattedDomain }));

        // Cancel any pending debounced calls
        debouncedDomainCheckRef.current.cancel();

        // Check domain availability if it's valid
        if (isDomainValid(formattedDomain)) {
            // Set checking state immediately for better UX
            setState((prev) => setDomainCheckingState(prev));

            // Debounce the actual API call
            debouncedDomainCheckRef.current(formattedDomain);
        } else {
            setState((prev) => resetDomainStatus(prev));
        }
    };

    const setWebsiteName = (name: string) => {
        setState((prev) => ({ ...prev, websiteName: name }));
    };

    const addCollaborator = (email: string) => {
        if (!email) return;

        if (!isEmailValid(email)) {
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
