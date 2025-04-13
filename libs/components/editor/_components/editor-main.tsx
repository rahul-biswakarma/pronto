"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../editor.context";
import { EditorInput } from "./editor-input";

// Define types for JSON structure
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

// Enhanced template parser function to handle more cases
const renderTemplate = (template: string, data: JsonObject): string => {
    // Log the data for debugging
    console.log("Template data:", data);

    // First handle sections with data attributes
    const processedTemplate = template.replace(
        /data-pronto-sec-id="([^"]+)"/g,
        (match, sectionId) => {
            console.log("Found section:", sectionId);
            // Check if there's corresponding data for this section
            const sectionKey = sectionId.replace("pronto-sec-", "");
            if (data[sectionKey]) {
                console.log(
                    `Found data for section ${sectionKey}:`,
                    data[sectionKey],
                );
                return `data-pronto-sec-id="${sectionId}" data-content="${JSON.stringify(data[sectionKey]).replace(/"/g, "&quot;")}"`;
            }
            return match;
        },
    );

    // Then replace {{key}} placeholders with values from the data object
    return processedTemplate.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        console.log("Found placeholder:", path);
        // Split nested keys like "user.name" into parts
        const keys = path.trim().split(".");

        // Navigate through nested objects
        let value: JsonValue = data;
        for (const k of keys) {
            if (value === undefined || value === null) return "";
            if (typeof value === "object" && !Array.isArray(value)) {
                value = (value as JsonObject)[k];
                console.log(`Accessing ${k}:`, value);
            } else if (Array.isArray(value) && !Number.isNaN(Number(k))) {
                // Handle array indices
                const index = Number(k);
                value = value[index];
                console.log(`Accessing array[${index}]:`, value);
            } else {
                console.log(`Could not access ${k} in`, value);
                return "";
            }
        }

        // Return the value or empty string if undefined/null
        return value !== undefined && value !== null ? String(value) : "";
    });
};

const MockContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="bg-accent w-full h-full max-h-full rounded-lg p-0.5 relative">
            <div className="bg-background rounded-sm h-full">
                <div className="w-full h-12 flex items-center justify-center border-b border-secondary relative cursor-pointer">
                    <div className="w-80 h-7 flex items-center relative">
                        <div
                            className="text-xs w-full text-center py-1 text-stone-500
                            bg-accent text-text-secondary rounded-lg
                            select-none cursor-pointer hover:opacity-80
                            transition-opacity duration-150 mix-blend-multiply dark:mix-blend-screen "
                            style={{ opacity: 1, transform: "none" }}
                        >
                            <span>self.so/nikhil</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                className="w-4 h-4 absolute right-1.5 top-1/2 -translate-y-1/2"
                            >
                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>{children}</div>
            </div>

            <EditorInput />
        </div>
    );
};

export const EditorMain = () => {
    const { portfolioHtml, portfolioContent } = useEditorContext();
    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (portfolioHtml && portfolioContent) {
            try {
                let html = portfolioHtml;
                for (const key of Object.keys(portfolioContent)) {
                    const value =
                        portfolioContent[key as keyof typeof portfolioContent];
                    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
                }
                // Render the template with JSON data using our enhanced parser
                setRenderedHtml(html);

                // Update iframe content if iframe is ready
                if (iframeRef.current) {
                    const doc = iframeRef.current.contentDocument;
                    if (doc) {
                        doc.open();
                        doc.write(html);
                        doc.close();
                    }
                }
            } catch (error) {
                console.error("Error rendering template:", error);
            }
        }
    }, [portfolioHtml, portfolioContent]);

    // Handle iframe load event to update content
    const handleIframeLoad = () => {
        if (iframeRef.current && renderedHtml) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(renderedHtml);
                doc.close();
            }
        }
    };

    return (
        <>
            <iframe
                ref={iframeRef}
                title="Portfolio Preview"
                onLoad={handleIframeLoad}
                style={{
                    backgroundColor: "transparent",
                    width: "100vw",
                    height: "100vh",
                    border: "none",
                }}
            />
            <EditorInput />
        </>
    );
};
