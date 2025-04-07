"use client";

import { PDFProcessor } from "@/components/features/pdf-processor/pdf-processor";
import { PortfolioPreview } from "@/components/features/portfolio/portfolio-preview";
import { useData } from "@/components/providers/data-provider";

export function AppLayout() {
    const { portfolioHtml } = useData();

    if (portfolioHtml) {
        return <PortfolioPreview />;
    }

    return <PDFProcessor />;
}
