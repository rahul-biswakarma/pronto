"use client";

import { Button } from "@/libs/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/libs/ui/resizable";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy, Edit, RotateCcw, Save, X } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";

export const DeveloperMode: React.FC = () => {
    const { portfolioHtml, setPortfolioHtml, setActiveMode } =
        useEditorContext();
    const [direction, setDirection] = useState<"horizontal" | "vertical">(
        "horizontal",
    );
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Detect window size to determine optimal direction
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setDirection("vertical");
            } else {
                setDirection("horizontal");
            }
        };

        // Set initial direction
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

    // Toggle direction between horizontal and vertical
    const toggleDirection = () => {
        setDirection(direction === "horizontal" ? "vertical" : "horizontal");
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

    // Exit developer mode
    const exitDeveloperMode = () => {
        setActiveMode(EDITOR_MODES.DEFAULT);
    };

    if (!portfolioHtml) {
        return <div>No HTML content available</div>;
    }

    return (
        <div className="w-full h-screen">
            {/* Resizable panels */}
            <ResizablePanelGroup
                direction={direction}
                className="h-full w-full"
            >
                {/* Preview Panel */}
                <ResizablePanel defaultSize={50}>
                    <div className="h-full w-full relative">
                        <iframe
                            srcDoc={portfolioHtml}
                            title="Portfolio Preview"
                            className="w-full h-full border-none"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Code Panel */}
                <ResizablePanel defaultSize={50}>
                    <div className="h-full w-full bg-[#1e1e1e] text-white relative">
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
                                        onClick={toggleDirection}
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                                    >
                                        <RotateCcw className="size-5" />
                                    </Button>
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={exitDeveloperMode}
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                                    >
                                        <X className="size-5" />
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
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
