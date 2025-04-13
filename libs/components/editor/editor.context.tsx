"use client";

import { dataLayer } from "@/libs/utils/data-layer";
import type React from "react";
import { createContext, useContext, useState } from "react";

// Define API response types
interface ContentResponse {
    content: Record<string, unknown>;
    deployUrl: string;
    isPublic: boolean;
    success: boolean;
    message: string;
}

interface HtmlResponse {
    html: string;
    deployUrl: string;
    isPublic: boolean;
    success: boolean;
    message: string;
}

interface PreviewResponse {
    html: string;
    previewType: string;
}

export type EditorContextType = {
    stage: EditorStages;
    setStage: (state: EditorStages) => void;
    pdfContent: string | null;
    setPdfContent: (pdfContent: string) => void;
    portfolioHtml: string | null;
    setPortfolioHtml: (portfolioHtml: string) => void;
    portfolioContent: string | null;
    setPortfolioContent: (portfolioContent: string) => void;
    generatePortfolioContent: (
        portfolioId: string,
        templateId: string,
    ) => Promise<void>;
    generatePortfolioHtml: (
        portfolioId: string,
        templateId: string,
    ) => Promise<void>;
    generatePortfolioPreview: (portfolioId: string) => Promise<string>;
    isLoading: boolean;
    error: string | null;
};

export type EditorStages =
    | "idle"
    | "generating_content"
    | "generating_portfolio";

export const EditorContext = createContext<EditorContextType>({
    stage: "idle",
    setStage: () => {},
    pdfContent: null,
    setPdfContent: () => {},
    portfolioHtml: null,
    setPortfolioHtml: () => {},
    portfolioContent: null,
    setPortfolioContent: () => {},
    generatePortfolioContent: async () => {},
    generatePortfolioHtml: async () => {},
    generatePortfolioPreview: async () => "",
    isLoading: false,
    error: null,
});

export const EditorProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [stage, setStage] = useState<EditorStages>("idle");
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [portfolioHtml, setPortfolioHtml] = useState<string | null>(null);
    const [portfolioContent, setPortfolioContent] = useState<string | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate JSON content for portfolio
    const generatePortfolioContent = async (
        portfolioId: string,
        templateId: string,
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            setStage("generating_content");
            const { data } = await dataLayer.post<ContentResponse>(
                "/api/portfolios/generate/content",
                {
                    portfolioId,
                    templateId,
                },
            );

            setPortfolioContent(JSON.stringify(data.content));
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMessage =
                error?.response?.data?.message || "Failed to generate content";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate HTML template based on JSON content
    const generatePortfolioHtml = async (
        portfolioId: string,
        templateId: string,
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            setStage("generating_portfolio");
            const { data } = await dataLayer.post<HtmlResponse>(
                "/api/portfolios/generate/html",
                {
                    portfolioId,
                    templateId: templateId,
                },
            );

            setPortfolioHtml(data.html);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMessage =
                error?.response?.data?.message ||
                "Failed to generate HTML template";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate portfolio preview (rendered HTML)
    const generatePortfolioPreview = async (
        portfolioId: string,
    ): Promise<string> => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await dataLayer.post<PreviewResponse>(
                "/api/portfolios/preview",
                {
                    portfolioId,
                },
            );

            return data.html;
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMessage =
                error?.response?.data?.message || "Failed to generate preview";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <EditorContext.Provider
            value={{
                stage,
                setStage,
                pdfContent,
                setPdfContent,
                portfolioHtml,
                setPortfolioHtml,
                portfolioContent,
                setPortfolioContent,
                generatePortfolioContent,
                generatePortfolioHtml,
                generatePortfolioPreview,
                isLoading,
                error,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};

export const useEditorContext = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error(
            "useEditorContext must be used within an EditorProvider",
        );
    }
    return context;
};
