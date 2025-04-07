"use client";

import { useData } from "@/components/context/data.context";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const PortfolioPreview: React.FC = () => {
    const { portfolioHtml } = useData();
    const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchPortfolioData() {
            try {
                setIsLoading(true);
                const response = await fetch("/api/portfolio/get");

                if (response.ok) {
                    const data = await response.json();
                    setPortfolioUrl(data.url);
                }
            } catch (error) {
                console.error("Error fetching portfolio:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPortfolioData();
    }, []);

    if (isLoading) {
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
        <Flex
            direction="column"
            gap="4"
            align="center"
            style={{ width: "100%", maxWidth: "800px" }}
        >
            <Box
                style={{
                    width: "100%",
                    height: "500px",
                    border: "1px solid var(--gray-6)",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                {portfolioHtml ? (
                    <iframe
                        srcDoc={portfolioHtml}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                        }}
                        title="Portfolio Preview"
                    />
                ) : (
                    <Flex
                        justify="center"
                        align="center"
                        direction="column"
                        gap="4"
                        style={{ height: "100%" }}
                    >
                        <Text>No portfolio content available</Text>
                        <Button onClick={() => router.push("/")}>
                            Create New Portfolio
                        </Button>
                    </Flex>
                )}
            </Box>

            <Flex gap="4">
                {portfolioUrl && (
                    <Button
                        variant="outline"
                        onClick={() => window.open(portfolioUrl, "_blank")}
                    >
                        View Live Site
                    </Button>
                )}
                <Button onClick={() => router.push("/editor")}>
                    Edit Portfolio
                </Button>
            </Flex>
        </Flex>
    );
};
