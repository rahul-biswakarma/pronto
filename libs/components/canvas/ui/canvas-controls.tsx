"use client";

import { Button } from "@/libs/ui/button";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useRef } from "react";
import { useCanvas } from "../contexts/canvas.context";
import { useZoom } from "../hooks/use-zoom";
import {
    CanvasEntityType,
    getDefaultEntitySize,
    getEntityTypeLabel,
} from "../utils/entity.types";

export default function CanvasControls() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { scale, zoomIn, zoomOut, resetZoom } = useZoom(canvasRef);
    const { addEntity, position } = useCanvas();

    const handleAddEntity = async (type: CanvasEntityType) => {
        const defaultSize = getDefaultEntitySize(type);

        // Calculate position in the center of the current view
        const centerX = -position.x / scale + window.innerWidth / (2 * scale);
        const centerY = -position.y / scale + window.innerHeight / (2 * scale);

        await addEntity({
            entity_type: type,
            content:
                type === CanvasEntityType.TEXT ? "Double click to edit" : null,
            html_variant_id: type === CanvasEntityType.HTML ? null : null, // This would be set when selecting an HTML variant
            x: centerX - defaultSize.width / 2,
            y: centerY - defaultSize.height / 2,
            width: defaultSize.width,
            height: defaultSize.height,
        });
    };

    return (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-2 flex flex-col gap-2">
            <div className="flex gap-2">
                <Button
                    onClick={zoomIn}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                    title="Zoom In"
                >
                    <IconPlus />
                </Button>
                <Button
                    onClick={zoomOut}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                    title="Zoom Out"
                >
                    <IconMinus />
                </Button>
                <Button
                    onClick={resetZoom}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                    title="Reset Zoom"
                >
                    100%
                </Button>
            </div>

            <div className="border-t my-1" />

            <div className="flex flex-wrap gap-1">
                {Object.values(CanvasEntityType).map((type) => (
                    <Button
                        key={type}
                        onClick={() => handleAddEntity(type)}
                        className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs"
                        title={`Add ${getEntityTypeLabel(type)}`}
                    >
                        {getEntityTypeLabel(type)}
                    </Button>
                ))}
            </div>
        </div>
    );
}
