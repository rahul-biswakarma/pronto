import type { User } from "@supabase/supabase-js";
import type { JSX } from "react";

export type EditorMode = {
    id: string;
    label?: string;
    actionRenderer?: (isActive: boolean) => JSX.Element;
    editorRenderer: () => JSX.Element;
};

export type EditorContextType = {
    dls: Record<string, string>;
    user: User;
    domain: string;
    portfolioId: string;
    routes: Record<string, string>;

    activeRoute: string;
    setActiveRoute: (route: string) => void;
    activeRoutePath: string;
    setActiveRoutePath: (path: string) => void;

    iframeRef: React.RefObject<HTMLIFrameElement | null>;

    modeId: string;
    modes: Record<string, EditorMode>;
    setModeId: (mode: string) => void;

    registerMode: (mode: EditorMode) => void;

    iframeDocument: Document | null;
    setIframeDocument: (doc: Document | null) => void;

    portfolioHtml: string;
    setPortfolioHtml: (html: string) => void;

    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;

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
