import type { JSX } from "react";

export type EditorMode = {
    id: string;
    label?: string;

    actionRenderer?: () => JSX.Element;
    editorRenderer: () => JSX.Element;
};

export type EditorContextType = {
    modeId: string;
    setModeId: (mode: string) => void;

    modes: Record<string, EditorMode>;
    registerMode: (mode: EditorMode) => void;

    iframeDocument: Document | null;
    setIframeDocument: (doc: Document | null) => void;

    portfolioHtml: string;
    setPortfolioHtml: (html: string) => void;

    hoveredElement: HTMLElement | null;
    setHoveredElement: (el: HTMLElement | null) => void;
    onHtmlChange: ({
        html,
        modeId,
        modeLabel,
    }: {
        html: string;
        modeId: string;
        modeLabel: string;
    }) => void;
};
