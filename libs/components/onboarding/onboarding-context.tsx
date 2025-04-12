"use client";

import {
    type Dispatch,
    type SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";

interface OnboardingContextType {
    selectedTemplateId: string | null;
    setSelectedTemplateId: Dispatch<SetStateAction<string | null>>;
    pdfContent: string | null;
    setPdfContent: Dispatch<SetStateAction<string | null>>;
}

const defaultData: OnboardingContextType = {
    selectedTemplateId: null,
    setSelectedTemplateId: () => {},
    pdfContent: null,
    setPdfContent: () => {},
};

export const OnboardingContext = createContext(defaultData);

export const OnboardingProvider = ({
    children,
}: { children: React.ReactNode }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        null,
    );
    const [pdfContent, setPdfContent] = useState<string | null>(null);

    return (
        <OnboardingContext.Provider
            value={{
                selectedTemplateId,
                setSelectedTemplateId,
                pdfContent,
                setPdfContent,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error(
            "useOnboarding must be used within an OnboardingProvider",
        );
    }
    return context;
};
