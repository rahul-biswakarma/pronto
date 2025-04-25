"use client";
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

export const EditorProvider: React.FC<
    Pick<EditorContextType, "user" | "portfolioId" | "dls"> & {
        children: React.ReactNode;
    }
> = ({ user, children, portfolioId, dls }) => {
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

    const invalidateRegisteredModes = () => {
        setModes((prevModes) => {
            const newModes = { ...prevModes };
            for (const key of Object.keys(newModes)) {
                delete newModes[key];
            }
            return newModes;
        });
    };

    return (
        <EditorContext.Provider
            value={{
                dls,
                user,
                iframeRef,
                portfolioId,

                modes,
                registerMode,
                invalidateRegisteredModes,

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
