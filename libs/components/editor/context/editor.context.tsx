"use client";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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

    useEffect(() => {
        // Function to update the theme class based on feno-color-lightness
        const updateThemeClass = () => {
            // Get the current value of --feno-color-lightness from dls (if it exists)
            let colorLightness = 1;
            if (
                dls?.theme &&
                typeof dls.theme["--feno-color-lightness"] === "number"
            ) {
                colorLightness = dls.theme["--feno-color-lightness"];
            } else if (iframeDocument) {
                // Try to get it from CSS variables as fallback
                const lightness = getComputedStyle(
                    iframeDocument.documentElement,
                )
                    .getPropertyValue("--feno-color-lightness")
                    .trim();
                if (lightness) {
                    colorLightness = Number.parseFloat(lightness);
                }
            }

            // Apply dark class if lightness is less than 0.4, otherwise light
            if (colorLightness < 0.4) {
                document.documentElement.classList.add("dark");
                document.documentElement.classList.remove("light");
            } else {
                document.documentElement.classList.add("light");
                document.documentElement.classList.remove("dark");
            }
        };

        // Initial update
        updateThemeClass();
    }, [dls, iframeDocument]);

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
