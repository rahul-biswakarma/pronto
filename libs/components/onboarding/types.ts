export type OnboardingState = {
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

export type OnboardingContextType = {
    state: OnboardingState;
    setWebsiteName: (name: string) => void;
    setDomain: (domain: string) => void;
    addCollaborator: (email: string) => void;
    removeCollaborator: (email: string) => void;
    checkDomainAvailability: (domain: string) => Promise<void>;
    createWebsite: () => Promise<string | null>;
    setError: (error: string | null) => void;
};
