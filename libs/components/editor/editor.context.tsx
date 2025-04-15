"use client";
import logger from "@/libs/utils/logger";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { DeviceType } from "./types";

export type EditorMode =
    | "default"
    | "section-edit"
    | "theme-editor"
    | "cms-edit"
    | "developer";

export type ThemeVariable = {
    name: string;
    value: string;
    displayName: string;
    variableType: "color" | "size" | "other";
};

export type CmsElement = {
    element: HTMLElement;
    originalText: string;
    path: string; // XPath or some identifier to locate the element
};

export type EditorContextType = {
    stage: EditorStages;
    setStage: (state: EditorStages) => void;
    pdfContent: string | null;
    setPdfContent: (pdfContent: string) => void;
    portfolioHtml: string | null;
    setPortfolioHtml: (portfolioHtml: string) => void;
    portfolioContent: object | null;
    setPortfolioContent: (portfolioContent: object) => void;
    selectedSection: { id: string; html: string } | null;
    setSelectedSection: (section: { id: string; html: string } | null) => void;
    availableModes: EditorMode[];
    setAvailableModes: (modes: EditorMode[]) => void;
    activeMode: EditorMode;
    setActiveMode: (mode: EditorMode) => void;
    themeVariables: ThemeVariable[];
    setThemeVariables: (variables: ThemeVariable[]) => void;
    updateThemeVariable: (name: string, value: string) => void;
    selectedCmsElement: CmsElement | null;
    setSelectedCmsElement: (element: CmsElement | null) => void;
    updateCmsElementText: (text: string) => void;
    deviceType: DeviceType;
    setDeviceType: (device: DeviceType) => void;
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
    selectedSection: null,
    setSelectedSection: () => {},
    availableModes: ["default"],
    setAvailableModes: () => {},
    activeMode: "default",
    setActiveMode: () => {},
    themeVariables: [],
    setThemeVariables: () => {},
    updateThemeVariable: () => {},
    selectedCmsElement: null,
    setSelectedCmsElement: () => {},
    updateCmsElementText: () => {},
    deviceType: "desktop",
    setDeviceType: () => {},
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
    const [selectedSection, setSelectedSection] = useState<{
        id: string;
        html: string;
    } | null>(null);
    const [availableModes, setAvailableModes] = useState<EditorMode[]>([
        "default",
        "section-edit",
        "cms-edit",
        "developer",
    ]);
    const [activeMode, setActiveMode] = useState<EditorMode>("default");
    const [themeVariables, setThemeVariables] = useState<ThemeVariable[]>([]);
    const [selectedCmsElement, setSelectedCmsElement] =
        useState<CmsElement | null>(null);
    const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

    // Extract CSS variables when HTML changes
    useEffect(() => {
        if (portfolioHtml) {
            extractCssVariables(portfolioHtml);
        }
    }, [portfolioHtml]);

    // When activeMode changes, clear selections for other modes
    useEffect(() => {
        // When switching modes, clear selections that don't apply to current mode
        if (activeMode !== "section-edit" && selectedSection) {
            setSelectedSection(null);
        }

        if (activeMode !== "cms-edit" && selectedCmsElement) {
            setSelectedCmsElement(null);
        }
    }, [activeMode, selectedSection, selectedCmsElement]);

    // Extract CSS variables from the HTML
    const extractCssVariables = (html: string) => {
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Find all style tags
        const styleTags = tempDiv.querySelectorAll("style");
        let cssText = "";

        // Extract CSS from all style tags
        for (const styleTag of styleTags) {
            cssText += styleTag.textContent || "";
        }

        // Look for :root { ... } blocks
        const rootRegex = /:root\s*{([^}]*)}/g;
        let rootMatch: RegExpExecArray | null;
        const foundVariables: ThemeVariable[] = [];

        // Extract variables from all :root blocks
        rootMatch = rootRegex.exec(cssText);
        while (rootMatch !== null) {
            const rootBlock = rootMatch[1];

            // Extract variable declarations
            const variableRegex = /--([^:]+)\s*:\s*([^;]+);/g;
            let variableMatch: RegExpExecArray | null;

            // Extract all variables from this :root block
            variableMatch = variableRegex.exec(rootBlock);
            while (variableMatch !== null) {
                const fullName = variableMatch[1].trim();
                const value = variableMatch[2].trim();

                // Filter for variables with feno-color prefix
                if (fullName.startsWith("feno-color")) {
                    // Extract display name from the variable name
                    let displayName = fullName.substring("feno-color-".length);

                    // Convert kebab-case to Title Case
                    displayName = displayName
                        .split("-")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ");

                    foundVariables.push({
                        name: `--${fullName}`,
                        value: value,
                        displayName: displayName,
                        variableType: "color",
                    });
                }

                // Get next variable match
                variableMatch = variableRegex.exec(rootBlock);
            }

            // Get next root match
            rootMatch = rootRegex.exec(cssText);
        }

        // Update theme variables and available modes
        setThemeVariables(foundVariables);

        // Only enable theme editor mode if we found theme variables
        if (foundVariables.length > 0) {
            setAvailableModes((prevModes) => {
                if (!prevModes.includes("theme-editor")) {
                    return [...prevModes, "theme-editor"];
                }
                return prevModes;
            });
        } else {
            setAvailableModes((prevModes) =>
                prevModes.filter((mode) => mode !== "theme-editor"),
            );

            // If current mode is theme-editor but no variables available, switch to default
            if (activeMode === "theme-editor") {
                setActiveMode("default");
            }
        }
    };

    // Update a theme variable in the HTML
    const updateThemeVariable = (name: string, value: string) => {
        if (!portfolioHtml) return;

        // Update the variable in our state
        setThemeVariables((prev) =>
            prev.map((variable) =>
                variable.name === name ? { ...variable, value } : variable,
            ),
        );

        // Update the variable in the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = portfolioHtml;

        // Find all style tags
        const styleTags = tempDiv.querySelectorAll("style");

        for (let i = 0; i < styleTags.length; i++) {
            const styleTag = styleTags[i];
            const css = styleTag.textContent || "";

            // Find and replace the variable in :root block
            const updatedCss = css.replace(
                new RegExp(`(${name}\\s*:\\s*)([^;]+)(;)`, "g"),
                `$1${value}$3`,
            );

            if (css !== updatedCss) {
                styleTag.textContent = updatedCss;

                // Update the full HTML
                setPortfolioHtml(tempDiv.innerHTML);
                return;
            }
        }
    };

    // Update CMS text element
    const updateCmsElementText = (text: string) => {
        if (!portfolioHtml || !selectedCmsElement) return;

        // Create a temporary DOM to modify the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = portfolioHtml;

        try {
            // Get element by its unique properties
            let targetElement = null;

            // Try to find by ID first if available
            if (selectedCmsElement.element.id) {
                targetElement = tempDiv.querySelector(
                    `#${selectedCmsElement.element.id}`,
                );
            }

            // If ID doesn't work, try XPath
            if (!targetElement) {
                try {
                    // Try to use XPath
                    const result = document.evaluate(
                        selectedCmsElement.path,
                        tempDiv,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null,
                    );

                    if (result) {
                        targetElement = result.singleNodeValue as HTMLElement;
                    }
                } catch (xpathError) {
                    logger.error({ error: xpathError }, "XPath failed");
                }
            }

            // Last resort: try to find by matching text content
            if (!targetElement) {
                // Find elements that match the tag name
                const tagName = selectedCmsElement.element.tagName;
                const elements = tempDiv.querySelectorAll(tagName);

                // Find the one with matching original text
                for (const el of elements) {
                    if (el.textContent === selectedCmsElement.originalText) {
                        targetElement = el;
                        break;
                    }
                }
            }

            // Update the text if we found the element
            if (targetElement) {
                targetElement.textContent = text;

                // Update the HTML in the context
                setPortfolioHtml(tempDiv.innerHTML);

                // Update the selected element
                setSelectedCmsElement({
                    ...selectedCmsElement,
                    originalText: text,
                });
            } else {
                logger.error(
                    "Could not find the target element to update text",
                );
            }
        } catch (error) {
            logger.error({ error }, "Error updating CMS element");
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
                selectedSection,
                setSelectedSection,
                availableModes,
                setAvailableModes,
                activeMode,
                setActiveMode,
                themeVariables,
                setThemeVariables,
                updateThemeVariable,
                selectedCmsElement,
                setSelectedCmsElement,
                updateCmsElementText,
                deviceType,
                setDeviceType,
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
