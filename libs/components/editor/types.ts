import type { EDITOR_MODES } from "./constants";

// Define the editor modes type
export type EditorMode = keyof typeof EDITOR_MODES;

// Theme variable type
export type ThemeVariable = {
    name: string;
    value: string;
    displayName: string;
    variableType: "color" | "size" | "other";
};

// CMS element type
export type CmsElement = {
    element: HTMLElement;
    originalText: string;
    path: string; // XPath or some identifier to locate the element
};

// Selected section type
export type SelectedSection = {
    id: string;
    html: string;
};

// Editor input mode context
export type EditorInputContext = {
    sectionEdit?: {
        id: string;
        html: string;
        name: string;
    };
    cmsEdit?: {
        element: HTMLElement;
        originalText: string;
        path: string;
    };
    themeEdit?: {
        variables: ThemeVariable[];
    };
};

// Editor stages
export type EditorStages =
    | "idle"
    | "generating_content"
    | "generating_portfolio";

export type DeviceType = "desktop" | "tablet" | "mobile" | "normal";
