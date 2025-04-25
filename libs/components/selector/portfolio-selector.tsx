"use client";

import { redirect } from "next/navigation";

export const PortfolioSelector = ({
    portfolioData,
}: {
    portfolioData: {
        id: string;
        domain: string;
    }[];
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Select a portfolio</h1>
            <div className="flex flex-col items-center justify-center">
                {portfolioData.map((portfolio) => (
                    <div
                        className="cursor-pointer"
                        onClick={() => {
                            redirect(`/${portfolio.domain}`);
                        }}
                        key={portfolio.id}
                    >
                        {portfolio.domain}
                    </div>
                ))}
            </div>
        </div>
    );
};
