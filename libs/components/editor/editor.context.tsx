"use client";

import type { Database } from "@/libs/supabase/database.types";
import type React from "react";
import { createContext, useContext, useState } from "react";
import type { EditorContextType, EditorMode } from "./types/editor.types";

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
};

export const EditorProvider: React.FC<{
    children: React.ReactNode;
    html: string;
    portfolio: Database["public"]["Tables"]["portfolio"]["Row"];
    onHtmlChange?: (updatedHtml: string) => void;
}> = ({ children, html, onHtmlChange: externalHtmlChangeHandler }) => {
    const [modeId, setModeId] = useState<string>("");
    const [modes, setModes] = useState<Record<string, EditorMode>>({});
    const [portfolioHtml, setPortfolioHtml] = useState<string>(html);
    const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
        null,
    );

    const registerMode = (mode: EditorMode) => {
        setModes((prevModes) => ({
            ...prevModes,
            [mode.id]: mode,
        }));
    };

    const onHtmlChange = ({
        html,
        modeId,
        modeLabel,
    }: {
        html: string;
        modeId: string;
        modeLabel: string;
    }) => {
        // Call external handler if provided
        if (externalHtmlChangeHandler) {
            externalHtmlChangeHandler(html);
        }
    };

    return (
        <EditorContext.Provider
            value={{
                modeId,
                setModeId,
                portfolioHtml,
                setPortfolioHtml,
                modes,
                registerMode,
                iframeDocument,
                setIframeDocument,
                hoveredElement,
                setHoveredElement,
                onHtmlChange,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};
