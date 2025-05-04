"use client";

import { Button } from "@/libs/ui/button";
import { IconEdit } from "@tabler/icons-react";
import { useMemo } from "react";
import { useDrag } from "../hooks/use-drag";
import { CanvasEntityType } from "../utils/entity.types";
import { getEntityStyle } from "../utils/transform";
import IframeEntity from "./iframe-entity";
// import ImageEntity from "./image-entity";
import ScribbleEntity from "./scribble-entity";
import TextEntity from "./text-entity";
import UrlEntity from "./url-entity";

type CanvasEntityProps = {
    id: string;
    type: CanvasEntityType;
    content: string | null;
    htmlVariantId: string | null;
    x: number;
    y: number;
    width: number | null;
    height: number | null;
};

export default function CanvasEntity({
    id,
    type,
    content,
    htmlVariantId,
    x,
    y,
    width,
    height,
}: CanvasEntityProps) {
    const { startDrag, selectedEntityId } = useDrag();
    const isSelected = selectedEntityId === id;

    const style = useMemo(
        () => getEntityStyle(x, y, width, height, isSelected),
        [x, y, width, height, isSelected],
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        startDrag(id, e);
    };

    const renderEntityContent = () => {
        switch (type) {
            case CanvasEntityType.HTML:
                return <IframeEntity htmlVariantId={htmlVariantId} />;
            case CanvasEntityType.TEXT:
                return <TextEntity content={content} />;
            case CanvasEntityType.URL:
                return <UrlEntity url={content} />;
            // case CanvasEntityType.IMAGE:
            //     return <ImageEntity src={content} />;
            case CanvasEntityType.SCRIBBLE:
                return <ScribbleEntity data={content} />;
            default:
                return <div>Unknown entity type</div>;
        }
    };

    return (
        <div
            className="canvas-entity"
            style={style}
            onMouseDown={handleMouseDown}
            data-entity-id={id}
            data-entity-type={type}
        >
            {renderEntityContent()}
            {isSelected && (
                <div className="entity-controls absolute top-0 right-0 bg-white p-1 rounded-bl border border-gray-200">
                    <Button className="text-xs p-1 hover:bg-gray-100 rounded">
                        <span className="sr-only">Resize</span>⤢
                    </Button>
                    <Button className="text-xs p-1 hover:bg-gray-100 rounded ml-1">
                        <span className="sr-only">Edit</span>
                        <IconEdit />
                    </Button>
                </div>
            )}
        </div>
    );
}
