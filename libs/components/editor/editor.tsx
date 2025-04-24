"use client";

import { PortfolioRenderer } from "./_components/portfolio-renderer";
import { useEditor } from "./editor.context";

export const Editor = () => {
  const { portfolioHtml } = useEditor();
  return <PortfolioRenderer portfolioHtml={portfolioHtml} />;
};
