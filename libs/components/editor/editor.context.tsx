"use client";
import type React from "react";
import { createContext, useContext, useState } from "react";

export type EditorContextType = {
    stage: EditorStages;
    setStage: (state: EditorStages) => void;
    pdfContent: string | null;
    setPdfContent: (pdfContent: string) => void;
    portfolioHtml: string | null;
    setPortfolioHtml: (portfolioHtml: string) => void;
    portfolioContent: object | null;
    setPortfolioContent: (portfolioContent: object) => void;
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
});

export const EditorProvider = ({
    children,
    html,
    contentJson,
}: {
    children: React.ReactNode;
    html: string;
    contentJson: object;
}) => {
    const [stage, setStage] = useState<EditorStages>("idle");
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [portfolioHtml, setPortfolioHtml] = useState<string | null>(html);
    const [portfolioContent, setPortfolioContent] = useState<object | null>(
        contentJson,
    );

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
