"use client";
import type { User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useRef, useState } from "react";
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
    user: User;
    children: React.ReactNode;
    html: string;
    dls: Record<string, string>;
    domain: string;
    activeRoute: string;
    onHtmlChange?: (updatedHtml: string) => void;
    portfolioId: string;
    routes: Record<string, string>;
}> = ({
    dls,
    user,
    html,
    routes,
    domain,
    children,
    portfolioId,
    activeRoute: initialActiveRoute,
    onHtmlChange: externalHtmlChangeHandler,
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [modeId, setModeId] = useState<string>("");
    const [modes, setModes] = useState<Record<string, EditorMode>>({});
    const [portfolioHtml, setPortfolioHtml] = useState<string>(html);
    const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
    const [activeRoute, setActiveRoute] = useState<string>(initialActiveRoute);
    const [activeRoutePath, setActiveRoutePath] = useState<string>(
        routes[initialActiveRoute],
    );

    const registerMode = (mode: EditorMode) => {
        setModes((prevModes) => ({
            ...prevModes,
            [mode.id]: mode,
        }));
    };

    const onHtmlChange = ({
        html,
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
                dls,
                user,
                domain,
                iframeRef,
                modeId,
                portfolioId,
                routes,

                setModeId,
                portfolioHtml,
                setPortfolioHtml,
                modes,

                activeRoute,
                setActiveRoute,
                activeRoutePath,
                setActiveRoutePath,

                registerMode,
                iframeDocument,

                setIframeDocument,
                onHtmlChange,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};
