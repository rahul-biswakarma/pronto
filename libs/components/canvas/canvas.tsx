"use client";

import { useCanvas } from "@/libs/contexts/canvas-context";
import { useRoute } from "@/libs/contexts/route-context";
import { Button } from "@/libs/ui/button";
import { Card } from "@/libs/ui/card";
import { Slider } from "@/libs/ui/slider";
import {} from "@/libs/ui/tabs";
import { useRef, useState } from "react";

type CanvasProps = {
    websites: Array<{ id: string; html: string; complete: boolean }>;
    isLoading: boolean;
};

export function Canvas({ isLoading }: CanvasProps) {
    const {
        variants,
        isGenerating,
        scale,
        setScale,
        selectedVariantId,
        setSelectedVariantId,
        autoCloseHtml,
    } = useCanvas();
    const { domain } = useRoute();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Handle canvas dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || e.button === 0) {
            // Middle mouse button or left button with spacebar
            setIsDragging(true);
            setStartPos({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle zoom
    const handleZoom = (value: number[]) => {
        setScale(value[0]);
    };

    // Select a variant
    const handleSelectVariant = (id: string) => {
        setSelectedVariantId(id);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={isGenerating}>
                        Generate New Variants
                    </Button>
                    <div className="w-40">
                        <Slider
                            value={[scale]}
                            min={0.25}
                            max={2}
                            step={0.05}
                            onValueChange={handleZoom}
                        />
                    </div>
                    <span className="text-sm">{Math.round(scale * 100)}%</span>
                </div>

                <div className="flex gap-2">
                    {variants.map((variant, index) => (
                        <Button
                            key={variant.id}
                            variant={
                                selectedVariantId === variant.id
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => handleSelectVariant(variant.id)}
                        >
                            Variant {index + 1}
                        </Button>
                    ))}
                </div>
            </div>

            <div
                className="flex-1 bg-muted/20 rounded-lg overflow-hidden relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                ref={canvasRef}
            >
                {isGenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-4 p-4 w-full max-w-6xl">
                            {variants.map((variant, index) => (
                                <Card
                                    key={variant.id}
                                    className="overflow-hidden flex flex-col h-[500px]"
                                >
                                    <div className="p-2 bg-muted/20 border-b flex justify-between items-center">
                                        <span className="text-sm font-medium">
                                            Variant {index + 1}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <div
                                                className={`w-2 h-2 rounded-full ${variant.complete ? "bg-green-500" : "bg-amber-500 animate-pulse"}`}
                                            />
                                            <span className="text-xs">
                                                {variant.complete
                                                    ? "Complete"
                                                    : "Generating..."}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        <iframe
                                            srcDoc={autoCloseHtml(
                                                variant.html ||
                                                    "<html><body><p>Generating...</p></body></html>",
                                            )}
                                            className="w-full h-full border-0"
                                            title={`Website Variant ${index + 1}`}
                                            sandbox="allow-same-origin"
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : variants.length > 0 && selectedVariantId ? (
                    <div
                        className="absolute transform-gpu transition-transform duration-200 ease-in-out"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: "0 0",
                        }}
                    >
                        <div className="bg-white shadow-lg rounded-md overflow-hidden">
                            <div className="p-2 bg-muted/20 border-b flex justify-between items-center">
                                <span className="text-sm font-medium">
                                    {domain}
                                </span>
                                <Button size="sm" variant="outline">
                                    Edit
                                </Button>
                            </div>
                            <iframe
                                srcDoc={autoCloseHtml(
                                    variants.find(
                                        (v) => v.id === selectedVariantId,
                                    )?.html || "",
                                )}
                                className="w-[1200px] h-[800px] border-0"
                                title="Selected Website"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Card className="p-6 max-w-md text-center">
                            <h3 className="text-lg font-medium mb-2">
                                No Website Variants
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Generate website variants to start editing
                            </p>
                            <Button>Generate Websites</Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
