"use client";

import { useCanvas } from "@/libs/contexts/canvas-context";
import { useRoute } from "@/libs/contexts/route-context";
import { Button } from "@/libs/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WebsiteGenerator({
    templateId,
    content,
}: {
    templateId: string;
    content: string;
}) {
    const router = useRouter();
    const { domain } = useRoute();
    const {
        variants,
        isGenerating,
        setIsGenerating,
        updateVariant,
        streamUpdate,
    } = useCanvas();
    const [error, setError] = useState<string | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );

    const handleGenerate = async () => {
        if (!content || !templateId) {
            setError("Content and template are required");
            return;
        }

        setError(null);
        setIsGenerating(true);

        try {
            // Reset variants
            for (const variant of variants) {
                updateVariant(variant.id, { html: "", complete: false });
            }

            // Create EventSource for SSE
            const eventSource = new EventSource(
                `/api/generate-websites?content=${encodeURIComponent(
                    content,
                )}&templateId=${encodeURIComponent(templateId)}`,
            );

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "init":
                        // Store website IDs
                        data.websiteIds.forEach(
                            (websiteId: string, index: number) => {
                                updateVariant(variants[index].id, {
                                    id: websiteId,
                                });
                            },
                        );
                        break;

                    case "chunk": {
                        // Update HTML for specific variant
                        const variantId = variants[data.variantIndex].id;
                        streamUpdate(variantId, data.chunk);
                        break;
                    }

                    case "complete":
                        // Mark variant as complete
                        updateVariant(variants[data.variantIndex].id, {
                            complete: true,
                        });
                        break;

                    case "error":
                        // Handle error for variant
                        setError(data.error);
                        break;

                    case "allComplete":
                        // Close connection
                        eventSource.close();
                        setIsGenerating(false);
                        break;
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                setError("Error connecting to server");
                setIsGenerating(false);
            };
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unknown error");
            setIsGenerating(false);
        }
    };

    const handleSelectVariant = () => {
        if (!selectedVariantId) {
            setError("Please select a variant");
            return;
        }

        // Navigate to the editor with the selected variant
        router.push(`/${domain}?variant=${selectedVariantId}`);
    };

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Websites"}
                </Button>

                {variants.some((v) => v.complete) && (
                    <Button
                        variant="outline"
                        onClick={handleSelectVariant}
                        disabled={isGenerating || !selectedVariantId}
                    >
                        Continue with Selected
                    </Button>
                )}
            </div>
        </div>
    );
}
