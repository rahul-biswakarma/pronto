"use client";
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  dls: any;
  html: string;
  domain: string;
  activeRoute: string;
  routes: { [key: string]: string };
  onHtmlChange?: (updatedHtml: string) => void;
}> = ({
  user,
  children,
  html,
  dls,
  domain,
  activeRoute: currentActiveRoute,
  routes,
  onHtmlChange: externalHtmlChangeHandler,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [modeId, setModeId] = useState<string>("section-editor");
  const [modes, setModes] = useState<Record<string, EditorMode>>({});
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
  const [activeRoute, setActiveRoute] = useState<string>(currentActiveRoute);
  const [portfolioHtml, setPortfolioHtml] = useState<string>(html);

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
        domain,
        iframeRef,
        // Editor state MOdes
        modes,
        modeId,
        setModeId,
        // Editor state Routes
        routes,
        activeRoute,
        setActiveRoute,
        // Editor state Portfolio
        portfolioHtml,
        setPortfolioHtml,
        // Editor state Register Mode
        registerMode,
        // Editor state Iframe Document
        iframeDocument,
        setIframeDocument,
        // Editor state On HTML Change
        onHtmlChange,
        // Editor state Preview Mode
        previewMode,
        setPreviewMode,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
