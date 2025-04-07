"use client";

import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

interface DataContextType {
    portfolioHtml: string | null;
    setPortfolioHtml: (html: string | null) => void;
    htmlUrl: string;
    setHtmlUrl: (url: string) => void;
}

const defaultContext: DataContextType = {
    portfolioHtml: null,
    setPortfolioHtml: () => {},
    htmlUrl: "",
    setHtmlUrl: () => {},
};

const DataContext = createContext<DataContextType>(defaultContext);

interface DataProviderProps {
    children: ReactNode;
    initialHtml?: string;
    htmlUrl?: string;
}

export function DataProvider({ children, htmlUrl = "" }: DataProviderProps) {
    const [portfolioHtml, setPortfolioHtml] = useState<string | null>(null);
    const [portfolioUrl, setHtmlUrl] = useState<string>(htmlUrl);

    useEffect(() => {
        const fetchHtmlFromUrl = async () => {
            const response = await fetch(htmlUrl);
            const html = await response.text();
            setPortfolioHtml(html);
        };

        fetchHtmlFromUrl();
    }, [htmlUrl]);

    const value = {
        portfolioHtml,
        setPortfolioHtml,
        htmlUrl: portfolioUrl,
        setHtmlUrl,
    };

    return (
        <DataContext.Provider value={value}>{children}</DataContext.Provider>
    );
}

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
