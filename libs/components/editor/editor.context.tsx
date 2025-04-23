"use client";

import type { Database } from "@/libs/supabase/database.types";
import type { User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useRef, useState } from "react";
import type { EditorContextType, EditorMode } from "./types/editor.types";

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
  html: string;
  portfolio: Database["public"]["Tables"]["portfolio"]["Row"];
  dls: Record<string, any>;
  onHtmlChange?: (updatedHtml: string) => void;
}> = ({
  user,
  portfolio,
  children,
  html,
  dls,
  onHtmlChange: externalHtmlChangeHandler,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [modeId, setModeId] = useState<string>("section-editor");
  const [modes, setModes] = useState<Record<string, EditorMode>>({});
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  const [portfolioHtml, setPortfolioHtml] = useState<string>(html);
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);

  const registerMode = (mode: EditorMode) => {
    setModes((prevModes) => ({
      ...prevModes,
      [mode.id]: mode,
    }));
  };

  const onHtmlChange = ({
    html,
  }: {
    html: string;
    modeId: string;
    modeLabel: string;
  }) => {
    // Call external handler if provided
    if (externalHtmlChangeHandler) {
      externalHtmlChangeHandler(html);
    }
  };

  return (
    <EditorContext.Provider
      value={{
        dls,
        user,
        iframeRef,
        modeId,
        portfolio,
        setModeId,
        portfolioHtml,
        setPortfolioHtml,
        modes,
        portfolioId: portfolio.id,
        registerMode,
        iframeDocument,
        setIframeDocument,
        onHtmlChange,
        previewMode,
        setPreviewMode,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
