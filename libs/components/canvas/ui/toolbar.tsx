"use client";

import { generateWebsiteHtml } from "@/libs/actions/generate-website";
import { type Template, templates } from "@/libs/constants/templates";
import { usePDFJS } from "@/libs/hooks/use-pdf";
import { Button } from "@/libs/ui/button";
import { IconTemplate, IconUpload, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useCanvas } from "../contexts/canvas.context";
import { CanvasEntityType } from "../utils/entity.types";

export default function Toolbar() {
    const [step, setStep] = useState<"templates" | "uploading" | "generating">(
        "templates",
    );
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );
    const [pdfContent, setPdfContent] = useState<string>("");
    const [variants, setVariants] = useState<{ [key: string]: string }>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<{
        [key: string]: boolean;
    }>({});
    const [entityIds, setEntityIds] = useState<{
        [key: string]: string | null;
    }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { addEntity, updateEntity, position, scale } = useCanvas();
    const { extractTextFromPDF, isLoading: isPdfLoading } = usePDFJS();

    // Handle template selection
    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
        setStep("uploading");
    };

    // Handle file upload click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedTemplate) return;

        try {
            // Extract text from PDF
            const text = await extractTextFromPDF(file);
            setPdfContent(text);

            // Move to generating step
            setStep("generating");

            // Create dummy entities first
            await createDummyEntities(selectedTemplate.id);

            // Then generate HTML variants
            await generateHtmlVariants(text, selectedTemplate.id);
        } catch (error) {
            console.error("Error processing PDF:", error);
        }
    };

    // Create dummy canvas entities with placeholder content
    const createDummyEntities = async (templateId: string) => {
        // Create three variants with different page types
        const pageTypes = ["portfolio", "personal", "professional"];

        // Initialize progress tracking
        const initialProgress = {};
        pageTypes.forEach((type) => {
            initialProgress[type] = false;
        });
        setGenerationProgress(initialProgress);

        // Create placeholder HTML for each variant
        const placeholderHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Generating ${templateId} Template</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f9fafb;
                        color: #374151;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        border-radius: 0.5rem;
                        background-color: white;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        max-width: 80%;
                    }
                    .loader {
                        border: 4px solid #e5e7eb;
                        border-top: 4px solid #3b82f6;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 1rem auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Generating Website</h1>
                    <div class="loader"></div>
                    <p>Please wait while we create your website...</p>
                </div>
            </body>
            </html>
        `;

        // Initialize variant placeholders
        const initialVariants: { [key: string]: string } = {};
        const newEntityIds: { [key: string]: string | null } = {};

        // Create entities for each variant
        await Promise.all(
            pageTypes.map(async (pageType, index) => {
                // Calculate position in the canvas
                const centerX =
                    -position.x / scale + window.innerWidth / (2 * scale);
                const centerY =
                    -position.y / scale + window.innerHeight / (2 * scale);
                const spacing = 850; // Space between variants

                // Create placeholder content with variant type
                const variantPlaceholder = placeholderHtml.replace(
                    "<h1>Generating Website</h1>",
                    `<h1>Generating ${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Website</h1>`,
                );

                initialVariants[pageType] = variantPlaceholder;

                // Create entity
                const entityId = await addEntity({
                    entity_type: CanvasEntityType.HTML,
                    content: variantPlaceholder,
                    html_variant_id: `${templateId}-${pageType}`,
                    x: centerX - 1200 + index * spacing,
                    y: centerY - 300,
                    width: 800,
                    height: 600,
                });

                newEntityIds[pageType] = entityId;
            }),
        );

        // Update state with initial variants and entity IDs
        setVariants(initialVariants);
        setEntityIds(newEntityIds);
    };

    // Generate HTML variants using Gemini
    const generateHtmlVariants = async (
        content: string,
        templateId: string,
    ) => {
        setIsGenerating(true);

        try {
            // Create three variants with different page types
            const pageTypes = ["portfolio", "personal", "professional"];

            // Generate content for each variant using server action
            await Promise.all(
                pageTypes.map(async (pageType) => {
                    try {
                        // Call server action to generate HTML
                        const result = await generateWebsiteHtml({
                            content,
                            templateId,
                            pageType,
                        });

                        if (result.success && result.html) {
                            // Get the entity ID for this variant
                            const entityId = entityIds[pageType];

                            // Make sure the HTML is valid
                            const validHtml = ensureValidHtml(result.html);

                            // Update the variant in state
                            setVariants((prev) => ({
                                ...prev,
                                [pageType]: validHtml,
                            }));

                            // Update the entity in the database
                            if (entityId) {
                                await updateEntity(entityId, {
                                    content: validHtml,
                                });
                            }

                            // Mark this variant as complete
                            setGenerationProgress((prev) => ({
                                ...prev,
                                [pageType]: true,
                            }));
                        } else {
                            console.error(
                                `Error generating ${pageType} variant:`,
                                result.error,
                            );
                        }
                    } catch (error) {
                        console.error(
                            `Error generating ${pageType} variant:`,
                            error,
                        );
                    }
                }),
            );
        } catch (error) {
            console.error("Error generating variants:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Ensure HTML is valid by adding any missing closing tags
    const ensureValidHtml = (html: string): string => {
        // If HTML doesn't start with DOCTYPE, add it
        if (!html.trim().startsWith("<!DOCTYPE")) {
            html = "<!DOCTYPE html>" + html;
        }

        // If HTML doesn't have <html> tags, add them
        if (!html.includes("<html>") && !html.includes("<html ")) {
            html = "<!DOCTYPE html><html>" + html + "</html>";
        }

        // If HTML doesn't have <head> tags, add them
        if (!html.includes("<head>") && !html.includes("<head ")) {
            const htmlStartIndex = html.indexOf("<html");
            const htmlEndIndex = html.indexOf(">", htmlStartIndex);
            if (htmlEndIndex !== -1) {
                const insertPosition = htmlEndIndex + 1;
                html =
                    html.slice(0, insertPosition) +
                    "<head><title>Generated Website</title></head>" +
                    html.slice(insertPosition);
            }
        }

        // If HTML doesn't have <body> tags, add them
        if (!html.includes("<body>") && !html.includes("<body ")) {
            const headEndIndex = html.indexOf("</head>");
            if (headEndIndex !== -1) {
                const insertPosition = headEndIndex + 7; // Length of </head>
                html =
                    html.slice(0, insertPosition) +
                    "<body>" +
                    html.slice(insertPosition) +
                    "</body>";
            } else {
                // If no </head>, insert before </html>
                const htmlEndIndex = html.indexOf("</html>");
                if (htmlEndIndex !== -1) {
                    html =
                        html.slice(0, htmlEndIndex) +
                        "<body></body>" +
                        html.slice(htmlEndIndex);
                }
            }
        }

        return html;
    };

    // Reset the process
    const handleReset = () => {
        setStep("templates");
        setSelectedTemplate(null);
        setPdfContent("");
        setVariants({});
        setGenerationProgress({});
        setEntityIds({});
    };

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-20 w-auto max-w-[90vw]">
            {step === "templates" && (
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <IconTemplate className="mr-2" size={20} />
                        Select a Template
                    </h3>
                    <div
                        className="grid grid-cols-3 gap-3 overflow-x-auto p-1"
                        style={{ maxWidth: "800px" }}
                    >
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="cursor-pointer hover:opacity-80 transition-opacity border rounded-md overflow-hidden flex flex-col"
                                onClick={() => handleTemplateSelect(template)}
                            >
                                <img
                                    src={template.image}
                                    alt={template.name}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="p-2">
                                    <h4 className="font-medium text-sm">
                                        {template.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === "uploading" && selectedTemplate && (
                <div className="flex flex-col items-center p-2">
                    <div className="flex justify-between w-full mb-3">
                        <h3 className="text-lg font-semibold flex items-center">
                            <IconUpload className="mr-2" size={20} />
                            Upload Resume PDF
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReset}
                        >
                            <IconX size={18} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-20 h-20 overflow-hidden rounded-md">
                            <img
                                src={selectedTemplate.image}
                                alt={selectedTemplate.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-medium">
                                {selectedTemplate.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                                {selectedTemplate.description}
                            </p>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <Button
                        onClick={handleUploadClick}
                        className="w-full"
                        disabled={isPdfLoading}
                    >
                        {isPdfLoading ? "Processing..." : "Upload PDF Resume"}
                    </Button>
                </div>
            )}

            {step === "generating" && (
                <div className="p-2">
                    <div className="flex justify-between w-full mb-3">
                        <h3 className="text-lg font-semibold">
                            {isGenerating
                                ? "Generating Variants..."
                                : "Website Variants"}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReset}
                        >
                            <IconX size={18} />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isGenerating}
                            className={
                                generationProgress["portfolio"]
                                    ? "bg-green-50 text-green-700"
                                    : ""
                            }
                        >
                            Portfolio{" "}
                            {generationProgress["portfolio"] ? "✓" : ""}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isGenerating}
                            className={
                                generationProgress["personal"]
                                    ? "bg-green-50 text-green-700"
                                    : ""
                            }
                        >
                            Personal {generationProgress["personal"] ? "✓" : ""}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isGenerating}
                            className={
                                generationProgress["professional"]
                                    ? "bg-green-50 text-green-700"
                                    : ""
                            }
                        >
                            Professional{" "}
                            {generationProgress["professional"] ? "✓" : ""}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
