"use client";

import { useData } from "@/components/context/data.context";
import { Flex, Text } from "@radix-ui/themes";

export const PortfolioPreview: React.FC = () => {
    const { portfolioHtml } = useData();

    if (!portfolioHtml) {
        return (
            <Flex
                justify="center"
                align="center"
                style={{ minHeight: "300px" }}
            >
                <Text>Loading your portfolio...</Text>
            </Flex>
        );
    }

    return (
        <div className="grid grid-cols-[30vw_70vw] h-full">
            <div className="h-full">chat</div>
            <div className="h-full w-full">
                <iframe
                    srcDoc={portfolioHtml}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    title="Portfolio Preview"
                />
            </div>
        </div>
    );
};
