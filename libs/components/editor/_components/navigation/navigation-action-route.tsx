"use client";

import { generateDynamicPage } from "@/app/actions/portfolio-actions-dynamic";
import { useEditor } from "@/libs/components/editor/editor.context";
import { templates } from "@/libs/constants/templates";
import {} from "@/libs/ui/prompt-input";
import {} from "lucide-react";
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

    const article = templates[0];

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
        <div className="p-1">
            <div className="feno-mod-container p-2">
                <code>feno.app</code>
            </div>
        </div>
    );
};
