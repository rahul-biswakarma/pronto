"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

type WebsiteVariant = {
    id: string;
    html: string;
    complete: boolean;
    error?: string;
};

type CanvasContextType = {
    isGenerating: boolean;
    setIsGenerating: (value: boolean) => void;
    variants: WebsiteVariant[];
    setVariants: (variants: WebsiteVariant[]) => void;
    selectedVariantId: string | null;
    setSelectedVariantId: (id: string | null) => void;
    scale: number;
    setScale: (scale: number) => void;
    generateWebsites: (templateId: string, content: string) => Promise<void>;
    autoCloseHtml: (html: string) => string;
    // Add these two new functions
    streamUpdate: (variantId: string, htmlChunk: string) => void;
    updateVariant: (
        variantId: string,
        updates: Partial<WebsiteVariant>,
    ) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [variants, setVariants] = useState<WebsiteVariant[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );
    const [scale, setScale] = useState(1);

    // Function to auto-close HTML tags for preview
    const autoCloseHtml = (html: string): string => {
        // Stack to track open tags
        const stack: string[] = [];
        const openTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
        const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)>/g;

        // Find all opening tags
        let match = openTagRegex.exec(html);
        while (match !== null) {
            const [_, tagName] = match;
            // Skip self-closing tags
            if (!match[0].endsWith("/>")) {
                stack.push(tagName);
            }
        }

        // Find all closing tags
        match = closeTagRegex.exec(html);
        while (match !== null) {
            const [_, tagName] = match;
            // Remove the last matching tag from stack
            const index = stack.lastIndexOf(tagName);
            if (index !== -1) {
                stack.splice(index, 1);
            }
        }

        // Close all remaining tags in reverse order
        let completedHtml = html;
        for (let i = stack.length - 1; i >= 0; i--) {
            completedHtml += `</${stack[i]}>`;
        }

        return completedHtml;
    };

    // Function to generate websites using Supabase Edge Function
    const generateWebsites = async (templateId: string, content: string) => {
        setIsGenerating(true);
        setVariants([]);

        try {
            // Call the Supabase Edge Function
            const response = await fetch("/api/generate-websites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ templateId, content }),
            });

            if (!response.ok) {
                throw new Error("Failed to start website generation");
            }

            // Set up event source for streaming
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            // Initialize variants
            const websiteVariants: WebsiteVariant[] = [
                { id: "1", html: "", complete: false },
                { id: "2", html: "", complete: false },
                { id: "3", html: "", complete: false },
            ];
            setVariants(websiteVariants);

            // Process the stream
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.substring(6));

                            if (data.type === "chunk") {
                                // Update the variant with new HTML chunk
                                websiteVariants[data.variantIndex].html =
                                    autoCloseHtml(data.html);
                                setVariants([...websiteVariants]);
                            } else if (data.type === "complete") {
                                // Mark variant as complete
                                websiteVariants[data.variantIndex].complete =
                                    true;
                                setVariants([...websiteVariants]);
                            } else if (data.type === "error") {
                                // Handle error for specific variant
                                websiteVariants[data.variantIndex].error =
                                    data.error;
                                setVariants([...websiteVariants]);
                            } else if (data.type === "allComplete") {
                                // All variants are complete
                                setIsGenerating(false);
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error generating websites:", error);
            setIsGenerating(false);
        }
    };

    // Add this function to update a variant with streaming HTML chunks
    const streamUpdate = (variantId: string, htmlChunk: string) => {
        setVariants((currentVariants) => {
            return currentVariants.map((variant) => {
                if (variant.id === variantId) {
                    return {
                        ...variant,
                        html: variant.html + htmlChunk,
                    };
                }
                return variant;
            });
        });
    };

    // Add this function to update variant properties
    const updateVariant = (
        variantId: string,
        updates: Partial<WebsiteVariant>,
    ) => {
        setVariants((currentVariants) => {
            return currentVariants.map((variant) => {
                if (variant.id === variantId) {
                    return {
                        ...variant,
                        ...updates,
                    };
                }
                return variant;
            });
        });
    };

    return (
        <CanvasContext.Provider
            value={{
                isGenerating,
                setIsGenerating,
                variants,
                setVariants,
                selectedVariantId,
                setSelectedVariantId,
                scale,
                setScale,
                generateWebsites,
                autoCloseHtml,
                // Add the new functions to the context value
                streamUpdate,
                updateVariant,
            }}
        >
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const context = useContext(CanvasContext);
    if (context === undefined) {
        throw new Error("useCanvas must be used within a CanvasProvider");
    }
    return context;
}
