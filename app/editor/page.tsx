"use client";

import { PortfolioPreview } from "@/components/portfolio-preview";
import {
    Box,
    Button,
    Card,
    Container,
    Flex,
    Heading,
    ScrollArea,
    Text,
} from "@radix-ui/themes";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function PortfolioEditorPage() {
    const [portfolioHtml, setPortfolioHtml] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Set up AI chat
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        setMessages,
        isLoading: isChatLoading,
    } = useChat({
        api: "/api/portfolio-chat",
        onFinish: (message) => {
            // Check if this is a code update message
            const content = message.content || "";
            if (content.includes("```html")) {
                const htmlMatch = content.match(/```html\n([\s\S]*?)```/);
                if (htmlMatch?.[1]) {
                    setPortfolioHtml(htmlMatch[1]);
                }
            }
        },
    });

    // Fetch the user's portfolio HTML
    useEffect(() => {
        async function fetchPortfolio() {
            try {
                setIsLoading(true);
                setFetchError(null);

                const response = await fetch("/api/portfolio/get");
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Failed to fetch portfolio",
                    );
                }

                const data = await response.json();
                if (data.html) {
                    setPortfolioHtml(data.html);

                    // Add a system message with current HTML
                    setMessages([
                        {
                            id: "system-1",
                            role: "system",
                            content: `You are a helpful assistant that helps users modify their portfolio website.
              The user already has a portfolio website with the following HTML. When they ask for changes,
              provide the complete updated HTML inside a code block with \`\`\`html and \`\`\` markers.

              Current portfolio HTML:
              \`\`\`html
              ${data.html}
              \`\`\``,
                        },
                    ]);
                } else {
                    setFetchError(
                        "No portfolio found. Please generate a portfolio first",
                    );
                    router.push("/");
                }
            } catch (error) {
                setFetchError(
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                );
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPortfolio();
    }, [router, setMessages]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle saving changes
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/portfolio/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ html: portfolioHtml }),
            });

            if (!response.ok) {
                throw new Error("Failed to save portfolio");
            }

            toast.success("Portfolio saved successfully");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" style={{ height: "100vh" }}>
                Loading portfolio...
            </Flex>
        );
    }

    if (fetchError) {
        return (
            <Flex
                justify="center"
                align="center"
                direction="column"
                gap="4"
                style={{ height: "100vh" }}
            >
                <Text size="5" color="red">
                    Error: {fetchError}
                </Text>
                <Text>Redirecting back to home page...</Text>
            </Flex>
        );
    }

    return (
        <Container
            size="4"
            p="4"
            style={{ marginTop: "2rem", marginBottom: "2rem" }}
        >
            <Heading size="5" mb="6">
                Portfolio Editor
            </Heading>

            <Flex gap="6" direction={{ initial: "column", md: "row" }}>
                {/* Left side: Chat UI */}
                <Card
                    style={{
                        flex: 1,
                        height: "80vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        p="3"
                        style={{ borderBottom: "1px solid var(--gray-6)" }}
                    >
                        <Text weight="bold">
                            Chat with AI to edit your portfolio
                        </Text>
                    </Box>

                    <ScrollArea
                        ref={chatContainerRef}
                        style={{ flex: 1, padding: "16px" }}
                        scrollbars="vertical"
                    >
                        <Flex direction="column" gap="4">
                            {messages.slice(1).map((message) => (
                                <Box
                                    key={message.id}
                                    p="3"
                                    style={{
                                        borderRadius: "8px",
                                        background:
                                            message.role === "user"
                                                ? "var(--blue-3)"
                                                : "var(--gray-3)",
                                        marginLeft:
                                            message.role === "user"
                                                ? "auto"
                                                : "0",
                                        maxWidth: "80%",
                                    }}
                                >
                                    <Text weight="bold" size="2" mb="1">
                                        {message.role === "user"
                                            ? "You"
                                            : "AI Assistant"}
                                    </Text>
                                    <Text style={{ whiteSpace: "pre-wrap" }}>
                                        {message.content.replace(
                                            /```html[\s\S]*?```/g,
                                            "[HTML code updated in preview]",
                                        )}
                                    </Text>
                                </Box>
                            ))}

                            {isChatLoading && (
                                <Box
                                    p="3"
                                    style={{
                                        borderRadius: "8px",
                                        background: "var(--gray-3)",
                                        maxWidth: "80%",
                                    }}
                                >
                                    <Text weight="bold" size="2" mb="1">
                                        AI Assistant
                                    </Text>
                                    <Text>Thinking...</Text>
                                </Box>
                            )}
                        </Flex>
                    </ScrollArea>

                    <Box p="3" style={{ borderTop: "1px solid var(--gray-6)" }}>
                        <form onSubmit={handleSubmit}>
                            <Flex gap="2">
                                <input
                                    type="text"
                                    placeholder="Ask AI to edit your portfolio..."
                                    value={input}
                                    onChange={handleInputChange}
                                    disabled={isChatLoading}
                                    style={{
                                        flex: 1,
                                        padding: "8px 12px",
                                        fontSize: "14px",
                                        border: "1px solid var(--gray-6)",
                                        borderRadius: "4px",
                                        background: "var(--color-panel)",
                                        color: "var(--gray-12)",
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={isChatLoading || !input.trim()}
                                >
                                    Send
                                </Button>
                            </Flex>
                        </form>
                    </Box>
                </Card>

                {/* Right side: Preview and Save */}
                <Flex direction="column" style={{ flex: 1, height: "80vh" }}>
                    <Box style={{ flex: 1, overflow: "hidden" }}>
                        <PortfolioPreview html={portfolioHtml} />
                    </Box>

                    <Box mt="4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{ width: "100%" }}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                </Flex>
            </Flex>
        </Container>
    );
}
