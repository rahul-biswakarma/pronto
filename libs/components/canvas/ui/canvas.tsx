"use client";

import { useRef } from "react";
import { useCanvas } from "../contexts/canvas.context";
import CanvasEntity from "../entities/canvas-entity";
import { usePan } from "../hooks/use-pan";
import { useZoom } from "../hooks/use-zoom";
import { getTransformStyle } from "../utils/transform";
import CanvasControls from "./canvas-controls";

export default function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { entities, isLoading, error, selectEntity } = useCanvas();
    const { scale } = useZoom(canvasRef);
    const { position, isPanning } = usePan(canvasRef);

    const transformStyle = getTransformStyle(scale, position.x, position.y);

    const handleCanvasClick = () => {
        // Deselect any selected entity when clicking on the canvas background
        selectEntity(null);
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-100">
            {/* Canvas controls */}
            <CanvasControls />

            {/* Loading state */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <div className="text-lg">Loading canvas...</div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <div className="text-lg text-red-500">{error}</div>
                </div>
            )}

            {/* Main canvas area */}
            <div
                ref={canvasRef}
                className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-default"}`}
                onClick={handleCanvasClick}
            >
                {/* Transformable canvas content */}
                <div className="absolute" style={transformStyle}>
                    {/* Canvas grid or background */}
                    <div className="w-[5000px] h-[5000px] bg-white">
                        <div className="w-full h-full bg-grid-pattern" />
                    </div>

                    {/* Canvas entities */}
                    {entities.map((entity) => (
                        <CanvasEntity
                            key={entity.id}
                            id={entity.id}
                            type={entity.entity_type}
                            content={entity.content}
                            htmlVariantId={entity.html_variant_id}
                            x={entity.x}
                            y={entity.y}
                            width={entity.width}
                            height={entity.height}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
