"use client";

import { generateDynamicPage } from "@/app/actions/portfolio-actions-dynamic";
import { useEditor } from "@/libs/components/editor/editor.context";
import { article_templates } from "@/libs/constants/article-templates";
import { Button } from "@/libs/ui/button";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/libs/ui/prompt-input";
import { cn } from "@/libs/utils/misc";
import { ArrowUp, Square } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
export const NavigationActionRoute = ({
    className,
}: {
    className?: string;
}) => {
    const { dls, domain, portfolioId } = useEditor();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const article = article_templates[0];

    const handleSubmit = async () => {
        setIsLoading(true);
        await handleGenerate();
        setIsLoading(false);
    };

    const handleValueChange = (value: string) => {
        setInput(value);
    };

    const handleGenerate = async () => {
        setError(null);

        startTransition(async () => {
            try {
                const result = await generateDynamicPage({
                    url: "about",
                    domain,
                    portfolioId,
                    templateId: article.id,
                    cssVariables: dls.theme,
                });

                if (result.success && result.pageId) {
                    router.push("/about");
                } else {
                    setError(result.error || "Failed to generate portfolio");
                }
            } catch (err) {
                console.error("Error calling generatePortfolioAction:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred",
                );
            }
        });
    };

    return (
        <PromptInput
            value={input}
            onValueChange={handleValueChange}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            className={cn("w-full max-w-(--breakpoint-md)", className)}
        >
            {article_templates.map((template) => (
                <div
                    key={template.id}
                    className="w-[100px] aspect-video overflow-hidden rounded-md border-2"
                >
                    <Image
                        className="object-cover w-full"
                        src={template.image}
                        alt={template.name}
                        width={100}
                        height={100}
                    />
                </div>
            ))}
            <PromptInputTextarea
                className="px-1 min-h-[160px]"
                placeholder="Ask me anything..."
                value={article.prompt}
            />
            <PromptInputActions className="justify-end pt-2">
                <PromptInputAction
                    tooltip={isLoading ? "Stop generation" : "Send message"}
                >
                    <Button
                        variant="default"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={handleSubmit}
                    >
                        {isLoading ? (
                            <Square className="size-5 fill-current" />
                        ) : (
                            <ArrowUp className="size-5" />
                        )}
                    </Button>
                </PromptInputAction>
            </PromptInputActions>
        </PromptInput>
    );
};
