"use client";

import {
    type Dispatch,
    type SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";

export type WorkflowStage =
    | "idle"
    | "upload"
    | "extraction"
    | "summarizing"
    | "portfolio_generating"
    | "completed"
    | "error";

type DataContextType = {
    stage: WorkflowStage;
    summary: string | null;
    portfolioHtml: string | null;
    portfolioUrl: string | null;
    setStage: Dispatch<SetStateAction<WorkflowStage>>;
    setSummary: Dispatch<SetStateAction<null | string>>;
    setPortfolioHtml: Dispatch<SetStateAction<null | string>>;
    setPortfolioUrl: Dispatch<SetStateAction<null | string>>;
    fetchHtmlFromUrl: (url: string) => Promise<string | null>;
};

const defaultState = {
    stage: "idle" as WorkflowStage,
    summary: null,
    portfolioHtml: null,
    portfolioUrl: null,
    setStage: () => {},
    setSummary: () => {},
    setPortfolioHtml: () => {},
    setPortfolioUrl: () => {},
    fetchHtmlFromUrl: async () => null,
};

const DataContext = createContext<DataContextType>(defaultState);

export const DataProvider = ({
    children,
    initialHtmlUrl = "",
}: {
    children: React.ReactNode;
    initialHtmlUrl?: string;
}) => {
    const [stage, setStage] = useState<WorkflowStage>(defaultState.stage);
    const [summary, setSummary] = useState<string | null>(defaultState.summary);
    const [portfolioHtml, setPortfolioHtml] = useState<string | null>(
        defaultState.portfolioHtml,
    );
    const [portfolioUrl, setPortfolioUrl] = useState<string | null>(
        initialHtmlUrl || null,
    );

    // Function to fetch HTML from URL
    const fetchHtmlFromUrl = async (url: string): Promise<string | null> => {
        if (!url) return null;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch HTML: ${response.status}`);
                return null;
            }
            const html = await response.text();
            setPortfolioHtml(html);
            return html;
        } catch (error) {
            console.error("Failed to fetch portfolio HTML:", error);
            return null;
        }
    };

    return (
        <DataContext.Provider
            value={{
                stage,
                summary,
                portfolioHtml,
                portfolioUrl,
                setStage,
                setSummary,
                setPortfolioHtml,
                setPortfolioUrl,
                fetchHtmlFromUrl,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
