import type { Database } from "@/libs/supabase/database.types";
import type { User } from "@supabase/supabase-js";
import type { JSX } from "react";

export type EditorMode = {
    id: string;
    label?: string;
    actionRenderer?: (isActive: boolean) => JSX.Element;
    editorRenderer: () => JSX.Element;
};

export type EditorContextType = {
    dls: Record<string, any>;
    user: User;
    portfolioId: string;

    iframeRef: React.RefObject<HTMLIFrameElement | null>;

    modeId: string;
    setModeId: (mode: string) => void;

    modes: Record<string, EditorMode>;
    registerMode: (mode: EditorMode) => void;

    iframeDocument: Document | null;
    setIframeDocument: (doc: Document | null) => void;

    portfolio: Database["public"]["Tables"]["portfolio"]["Row"];
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
