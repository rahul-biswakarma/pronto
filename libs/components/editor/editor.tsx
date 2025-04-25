"use client";

import { PortfolioRenderer } from "./_components/portfolio-renderer";
import { useRouteContext } from "./context/route.context";

export const Editor = () => {
    const { activeRouteHtml } = useRouteContext();
    return <PortfolioRenderer portfolioHtml={activeRouteHtml} />;
};
