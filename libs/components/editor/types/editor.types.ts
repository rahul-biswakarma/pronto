import type { User } from "@supabase/supabase-js";
import type { JSX } from "react";

export type EditorMode = {
    id: string;
    label?: string;

    actionRenderer?: (isActive: boolean) => JSX.Element;
    editorRenderer: () => JSX.Element;
};

export type EditorContextType = {
    user: User;
    portfolioId: string;

    iframeRef: React.RefObject<HTMLIFrameElement | null>;

    modeId: string;
    setModeId: (mode: string) => void;

    modes: Record<string, EditorMode>;
    registerMode: (mode: EditorMode) => void;

    iframeDocument: Document | null;
    setIframeDocument: (doc: Document | null) => void;

    portfolioHtml: string;
    setPortfolioHtml: (html: string) => void;

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
