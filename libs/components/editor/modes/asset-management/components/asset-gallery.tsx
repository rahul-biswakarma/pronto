"use client";

import { Button } from "@/libs/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import type { Asset } from "../types";

interface AssetGalleryProps {
    assets: Asset[];
    isLoading: boolean;
    selectedAsset: Asset | null;
    onSelectAsset: (asset: Asset | null) => void;
    iframeDocument: Document | null;
}

export const AssetGallery: React.FC<AssetGalleryProps> = ({
    assets,
    isLoading,
    selectedAsset,
    onSelectAsset,
    iframeDocument,
}) => {
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);

    const handleAssetClick = useCallback(
        (asset: Asset) => {
            onSelectAsset(selectedAsset?.id === asset.id ? null : asset);
        },
        [selectedAsset, onSelectAsset],
    );

    const handleDeleteAsset = useCallback(
        async (assetId: string, e: React.MouseEvent) => {
            e.stopPropagation();
            try {
                const response = await fetch(`/api/assets/${assetId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    // If the deleted asset was selected, deselect it
                    if (selectedAsset?.id === assetId) {
                        onSelectAsset(null);
                    }

                    // Refresh the asset list
                    window.location.reload();
                }
            } catch (error) {
                console.error("Failed to delete asset:", error);
            }
        },
        [selectedAsset, onSelectAsset],
    );

    const handleDragStart = useCallback(
        (asset: Asset, e: React.DragEvent<HTMLDivElement>) => {
            setDraggedAsset(asset);
            // Set custom drag preview image
            const img = new Image();
            img.src = asset.url;
            e.dataTransfer.setDragImage(img, 10, 10);
            e.dataTransfer.setData("text/plain", asset.url);
        },
        [],
    );

    const handleDragEnd = useCallback(() => {
        setDraggedAsset(null);
    }, []);

    // Setup drag and drop handlers for iframe interaction
    const setupIframeDropHandlers = useCallback(() => {
        if (!iframeDocument || !draggedAsset) return;

        // Handle dragover to allow drops on elements
        const handleIframeDragOver = (e: DragEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;

            // Highlight image elements when dragging over them
            if (target.tagName === "IMG") {
                target.style.outline =
                    "2px dashed var(--feno-interactive-focused-border)";
                target.style.filter = "brightness(0.8)";
            }
        };

        // Handle dragleave to remove highlighting
        const handleIframeDragLeave = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
                target.style.outline = "";
                target.style.filter = "";
            }
        };

        // Handle drop to replace image
        const handleIframeDrop = (e: DragEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;

            // Remove highlighting
            if (target.tagName === "IMG") {
                target.style.outline = "";
                target.style.filter = "";

                // Replace image source
                (target as HTMLImageElement).src = draggedAsset.url;
                (target as HTMLImageElement).alt = draggedAsset.filename;
            }
        };

        iframeDocument.addEventListener("dragover", handleIframeDragOver);
        iframeDocument.addEventListener("dragleave", handleIframeDragLeave);
        iframeDocument.addEventListener("drop", handleIframeDrop);

        return () => {
            iframeDocument.removeEventListener(
                "dragover",
                handleIframeDragOver,
            );
            iframeDocument.removeEventListener(
                "dragleave",
                handleIframeDragLeave,
            );
            iframeDocument.removeEventListener("drop", handleIframeDrop);
        };
    }, [iframeDocument, draggedAsset]);

    // Add and remove iframe handlers when drag state changes
    useState(() => {
        const cleanup = setupIframeDropHandlers();
        return cleanup;
    }, [setupIframeDropHandlers]);

    if (isLoading && assets.length === 0) {
        return <div className="text-center py-4">Loading assets...</div>;
    }

    if (assets.length === 0) {
        return (
            <div className="text-center py-4 text-[var(--feno-text-3)]">
                No assets found. Upload your first image.
            </div>
        );
    }

    return (
        <div>
            <h4 className="text-sm font-medium mb-2">Your Assets</h4>
            <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {assets.map((asset) => (
                    <div
                        key={asset.id}
                        className={`relative group rounded-md border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                            selectedAsset?.id === asset.id
                                ? "border-[var(--feno-interactive-focused-border)] ring-1 ring-[var(--feno-interactive-focused-border)]"
                                : "border-[var(--feno-border-1)]"
                        }`}
                        onClick={() => handleAssetClick(asset)}
                        draggable
                        onDragStart={(e) => handleDragStart(asset, e)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="aspect-w-4 aspect-h-3 w-full">
                            <img
                                src={asset.url}
                                alt={asset.filename}
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleDeleteAsset(asset.id, e)}
                            >
                                <IconTrash className="size-4" />
                            </Button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-1 text-[10px] bg-black bg-opacity-50 text-white truncate">
                            {asset.filename}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
