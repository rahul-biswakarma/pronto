import type React from "react";

export const PortfolioRenderer: React.FC<{
    portfolioHtml: string;
}> = ({ portfolioHtml }) => {
    return (
        <iframe
            className="w-screen h-screen"
            srcDoc={portfolioHtml}
            title="Portfolio"
        />
    );
};
