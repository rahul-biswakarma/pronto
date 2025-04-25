"use client";
import type { User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useRef, useState } from "react";
import type { EditorContextType, EditorMode } from "../types/editor.types";

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
    portfolioId: string;
}> = ({ user, children, portfolioId }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [modeId, setModeId] = useState<string>("");
    const [modes, setModes] = useState<Record<string, EditorMode>>({});

    const [iframeDocument, setIframeDocument] = useState<Document | null>(null);

    const registerMode = (mode: EditorMode) => {
        setModes((prevModes) => ({
            ...prevModes,
            [mode.id]: mode,
        }));
    };

    return (
        <EditorContext.Provider
            value={{
                user,
                iframeRef,
                portfolioId,

                modes,
                registerMode,

                modeId,
                setModeId,

                iframeDocument,
                setIframeDocument,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};
