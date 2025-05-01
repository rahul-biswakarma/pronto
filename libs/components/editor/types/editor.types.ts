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
    dls: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        theme: Record<string, any>;
    };

    iframeRef: React.RefObject<HTMLIFrameElement | null>;

    modeId: string;
    modes: Record<string, EditorMode>;
    setModeId: (mode: string) => void;

    registerMode: (mode: EditorMode) => void;
    invalidateRegisteredModes: () => void;

    iframeDocument: Document | null;
    setIframeDocument: (doc: Document | null) => void;

    selectedElement: HTMLElement | null;
    setSelectedElement: (element: HTMLElement | null) => void;
};
