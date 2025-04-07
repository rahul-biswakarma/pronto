"use client";

import { useData } from "@/components/context/data.context";
import { Flex, Text } from "@radix-ui/themes";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

export const PortfolioPreview: React.FC = () => {
    const { portfolioHtml } = useData();
    const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

    useEffect(() => {
        if (portfolioHtml) {
            // Sanitize HTML on client-side to prevent XSS
            const clean = DOMPurify.sanitize(portfolioHtml, {
                USE_PROFILES: { html: true },
                FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
                ADD_URI_SAFE_ATTR: ["target"],
            });
            setSanitizedHtml(clean);
        }
    }, [portfolioHtml]);

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
                    srcDoc={sanitizedHtml}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    title="Portfolio Preview"
                    sandbox="allow-scripts"
                />
            </div>
        </div>
    );
};
