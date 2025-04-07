"use client";

import { useData } from "./context/data.context";
import { GeneratorPage } from "./generator/generator-page";
import { PortfolioPreview } from "./portfolio-preview";

export const App = () => {
    const { portfolioHtml } = useData();
    if (portfolioHtml) {
        return <PortfolioPreview />;
    }
    return <GeneratorPage />;
};
