"use client";

import {
    type Dispatch,
    type SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type DataContextType = {
    summary: string | null;
    portfolioHtml: string | null;
    setSummary: Dispatch<SetStateAction<null | string>>;
    setPortfolioHtml: Dispatch<SetStateAction<null | string>>;
};

const defaultState = {
    summary: null,
    portfolioHtml: null,
    setSummary: () => {},
    setPortfolioHtml: () => {},
};

const DataContext = createContext<DataContextType>(defaultState);

export const DataProvider = ({
    children,
    htmlUrl = "",
}: {
    children: React.ReactNode;
    htmlUrl?: string;
}) => {
    const [summary, setSummary] = useState<string | null>(defaultState.summary);
    const [portfolioHtml, setPortfolioHtml] = useState<string | null>(
        defaultState.portfolioHtml,
    );

    useEffect(() => {
        const fetchPortfolioHtml = async () => {
            if (!htmlUrl) return;

            try {
                const response = await fetch(htmlUrl);
                const html = await response.text();
                setPortfolioHtml(html);
            } catch (error) {
                console.error("Failed to fetch portfolio HTML:", error);
            }
        };

        fetchPortfolioHtml();
    }, [htmlUrl]);

    return (
        <DataContext.Provider
            value={{ summary, portfolioHtml, setSummary, setPortfolioHtml }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const { summary, portfolioHtml, setSummary, setPortfolioHtml } =
        useContext(DataContext);

    return { summary, portfolioHtml, setSummary, setPortfolioHtml };
};
