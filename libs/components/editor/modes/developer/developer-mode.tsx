"use client";

import { Button } from "@/libs/ui/button";
import Editor, { type OnMount } from "@monaco-editor/react";
import { ArrowLeft, Copy, Edit, RotateCcw, Save } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";

export const DeveloperMode: React.FC = () => {
    const { portfolioHtml, setPortfolioHtml, setActiveMode } =
        useEditorContext();
    const [layout, setLayout] = useState<"vertical" | "horizontal">(
        "horizontal",
    );
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Detect window size to determine optimal layout
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setLayout("vertical");
            } else {
                setLayout("horizontal");
            }
        };

        // Set initial layout
        handleResize();

        // Add resize listener
        window.addEventListener("resize", handleResize);

        // Clean up
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle editor mount
    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    // Copy HTML to clipboard
    const copyToClipboard = () => {
        if (portfolioHtml) {
            navigator.clipboard.writeText(portfolioHtml);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    // Toggle layout between horizontal and vertical
    const toggleLayout = () => {
        setLayout(layout === "horizontal" ? "vertical" : "horizontal");
    };

    // Toggle between editing and viewing
    const toggleEditing = () => {
        setIsEditing(!isEditing);
    };

    // Save the edited HTML
    const saveEditedHtml = () => {
        if (editorRef.current) {
            const updatedCode = editorRef.current.getValue();
            setPortfolioHtml(updatedCode);
            setIsEditing(false);
        }
    };

    if (!portfolioHtml) {
        return <div>No HTML content available</div>;
    }

    const layoutClasses =
        layout === "horizontal"
            ? "flex flex-row h-screen"
            : "flex flex-col h-screen";

    const paneClasses =
        layout === "horizontal" ? "h-full w-1/2" : "h-1/2 w-full";

    return (
        <div className={layoutClasses}>
            {/* Header Controls */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveMode(EDITOR_MODES.DEFAULT)}
                    className="bg-white/70 backdrop-blur-sm hover:bg-white/90"
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLayout}
                    className="bg-white/70 backdrop-blur-sm hover:bg-white/90"
                >
                    <RotateCcw className="size-5" />
                </Button>
            </div>

            {/* Preview Pane */}
            <div className={`${paneClasses} relative`}>
                <iframe
                    srcDoc={portfolioHtml}
                    title="Portfolio Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-same-origin"
                />
            </div>

            {/* Code Pane */}
            <div className={`${paneClasses} bg-[#1e1e1e] text-white relative`}>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {isEditing ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveEditedHtml}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        >
                            <Save className="size-5" />
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleEditing}
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                            >
                                <Edit className="size-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={copyToClipboard}
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                            >
                                {isCopied ? (
                                    <span className="text-sm px-2">
                                        Copied!
                                    </span>
                                ) : (
                                    <Copy className="size-5" />
                                )}
                            </Button>
                        </>
                    )}
                </div>
                <div className="w-full h-full">
                    <Editor
                        height="100%"
                        defaultLanguage="html"
                        value={portfolioHtml}
                        theme="vs-dark"
                        options={{
                            readOnly: !isEditing,
                            minimap: { enabled: true },
                            fontSize: 14,
                            wordWrap: "on",
                            formatOnPaste: true,
                            formatOnType: true,
                            automaticLayout: true,
                        }}
                        onMount={handleEditorDidMount}
                    />
                </div>
            </div>
        </div>
    );
};
