import { generatePortfolioTemplateAction } from "@/app/actions/portfolio-actions-template";
import { templates } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconCloud } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { useEditor } from "../../context/editor.context";
import { useRouteContext } from "../../context/route.context";
import type { EditorMode } from "../../types/editor.types";

export const TemplateSelector = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>();
    const [isGenerating, setIsGenerating] = useState(false);

    const { dls, portfolioId } = useEditor();
    const { activeRoute } = useRouteContext();

    const handleGenerate = async () => {
        if (!selectedTemplate) {
            return;
        }
        setIsGenerating(true);
        await generatePortfolioTemplateAction({
            cssVariables: dls?.theme,
            templateId: selectedTemplate ?? "",
            portfolioId: portfolioId ?? "",
            route: activeRoute,
        });
        setIsGenerating(false);
    };

    return (
        <div className="flex flex-col gap-2 w-[min(900px,90vw)]">
            <div className="flex gap-2">
                {templates
                    .filter((template) =>
                        template.id.startsWith("feno-article:"),
                    )
                    .map((template) => (
                        <div
                            key={template.id}
                            className="flex p-1 bg-background rounded-xl"
                            onClick={() => setSelectedTemplate(template.id)}
                        >
                            <div className="relative aspect-square w-[150px] rounded-lg overflow-hidden">
                                <Image
                                    src={template.image}
                                    alt={template.name}
                                    fill
                                    className="object-cover object-top"
                                />
                                {selectedTemplate === template.id && (
                                    <div
                                        className={cn(
                                            "absolute bottom-2 right-2 flex items-center justify-center w-3 h-3 rounded-full",
                                            template.id.startsWith(
                                                "feno-article:",
                                            )
                                                ? "bg-white"
                                                : "bg-red-500",
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
            </div>
            <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? "Generating..." : "Generate"}
            </Button>
        </div>
    );
};

// Export theme editor mode
export const TemplateSelectorMode = (): EditorMode => {
    return {
        id: "template-selector",
        label: "Template Selector",
        actionRenderer: (isActive) => (
            <Button
                variant="custom"
                size="icon"
                className={cn("feno-mode-button", {
                    "feno-mode-active-button": isActive,
                })}
            >
                <IconCloud className="size-[17px] stroke-[1.8]" />
            </Button>
        ),
        editorRenderer: () => <TemplateSelector />,
    };
};
