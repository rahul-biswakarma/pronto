import { Button } from "@/libs/ui/button";
import { cn } from "@/libs/utils/misc";
import { IconPhoto } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useEditor } from "../../context/editor.context";
import type { EditorMode } from "../../types/editor.types";
import { AssetGallery } from "./components/asset-gallery";
import { AssetUploader } from "./components/asset-uploader";
import type { Asset } from "./types";

// Asset Management component
const AssetManagement: React.FC = () => {
    const { iframeDocument, iframeRef } = useEditor();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [selectedImageElement, setSelectedImageElement] =
        useState<HTMLImageElement | null>(null);

    // Fetch user's assets on mount
    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/assets");
                const data = await response.json();
                setAssets(data.assets || []);
            } catch (error) {
                console.error("Failed to fetch assets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    // Setup click handler for images in the iframe
    useEffect(() => {
        if (!iframeDocument) return;

        const handleImageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
                setSelectedImageElement(target as HTMLImageElement);
            } else {
                setSelectedImageElement(null);
            }
        };

        iframeDocument.addEventListener("click", handleImageClick);

        return () => {
            iframeDocument.removeEventListener("click", handleImageClick);
        };
    }, [iframeDocument]);

    // Handle asset upload
    const handleAssetUpload = useCallback(async (file: File) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/assets/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setAssets((prev) => [...prev, data.asset]);
            }
        } catch (error) {
            console.error("Failed to upload asset:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Replace selected image with selected asset
    const handleReplaceImage = useCallback(() => {
        if (!selectedImageElement || !selectedAsset) return;

        selectedImageElement.src = selectedAsset.url;
        selectedImageElement.alt = selectedAsset.filename;
        setSelectedImageElement(null);
    }, [selectedImageElement, selectedAsset]);

    return (
        <div className="flex h-full w-full flex-col gap-1.5 min-w-[500px] max-w-[500px]">
            <div className="p-3">
                <h3 className="text-lg font-medium mb-2">Asset Management</h3>

                {selectedImageElement && selectedAsset && (
                    <div className="mb-3 p-2 bg-[var(--feno-surface-1)] rounded-md">
                        <p className="text-sm mb-2">
                            Replace selected image with {selectedAsset.filename}
                            ?
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleReplaceImage}
                                variant="custom"
                                className="bg-[var(--feno-interactive-resting-bg)] hover:bg-[var(--feno-interactive-hovered-bg)] border-[var(--feno-interactive-resting-border)]"
                            >
                                Replace
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setSelectedAsset(null)}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                <AssetUploader
                    onUpload={handleAssetUpload}
                    isUploading={loading}
                />

                <AssetGallery
                    assets={assets}
                    isLoading={loading}
                    selectedAsset={selectedAsset}
                    onSelectAsset={setSelectedAsset}
                    iframeDocument={iframeDocument}
                />
            </div>
        </div>
    );
};

// Export the editor mode
export const AssetManagementMode = (): EditorMode => {
    return {
        id: "asset-management",
        label: "Manage Assets",
        actionRenderer: (isActive) => (
            <Button
                variant="custom"
                size="icon"
                className={cn("feno-mode-button", {
                    "feno-mode-active-button": isActive,
                })}
            >
                <IconPhoto className="size-[17px] stroke-[1.8]" />
            </Button>
        ),
        editorRenderer: () => <AssetManagement />,
    };
};
