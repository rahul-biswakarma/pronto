"use client";

import type { Template } from "@/libs/constants/templates";
import type { User } from "@supabase/supabase-js";
import {
    type Dispatch,
    type SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";

type Category = {
    title: string;
    filter: (template: Template) => boolean;
    value: string;
};

interface OnboardingContextType {
    user: User | null;
    selectedTemplate: Template | null;
    setSelectedTemplate: Dispatch<SetStateAction<Template | null>>;
    pdfContent: string | null;
    setPdfContent: Dispatch<SetStateAction<string | null>>;
    selectedCategory: string | null;
    setSelectedCategory: Dispatch<SetStateAction<string | null>>;
    categories: Category[];
}

const categories: Category[] = [
    {
        title: "Portfolios",
        filter: (t) => t.id.startsWith("feno:"),
        value: "feno:",
    },
    {
        title: "Articles",
        filter: (t) => t.id.startsWith("feno-article:"),
        value: "feno-article:",
    },
    // TODO: Add more categories as needed
];

const defaultData: OnboardingContextType = {
    user: null,
    selectedTemplate: null,
    setSelectedTemplate: () => {},
    pdfContent: null,
    setPdfContent: () => {},
    selectedCategory: categories[0].value,
    setSelectedCategory: () => {},
    categories,
};

export const OnboardingContext = createContext(defaultData);

export const OnboardingProvider = ({
    children,
    user,
}: { children: React.ReactNode; user: User }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        categories[0].value,
    );

    return (
        <OnboardingContext.Provider
            value={{
                user,

                categories,

                selectedTemplate,
                setSelectedTemplate,

                pdfContent,
                setPdfContent,

                selectedCategory,
                setSelectedCategory,
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
