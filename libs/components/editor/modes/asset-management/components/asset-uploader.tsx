"use client";

import { Button } from "@/libs/ui/button";
import { IconLoader, IconUpload } from "@tabler/icons-react";
import { useCallback, useState } from "react";

interface AssetUploaderProps {
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
    onUpload,
    isUploading,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // Filter for image files only
                const imageFiles = Array.from(files).filter((file) =>
                    file.type.startsWith("image/"),
                );

                if (imageFiles.length > 0) {
                    onUpload(imageFiles[0]);
                }
            }
        },
        [onUpload],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files?.length) {
                onUpload(files[0]);
            }
        },
        [onUpload],
    );

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
                isDragging
                    ? "border-[var(--feno-interactive-focused-border)] bg-[var(--feno-interactive-focused-bg)]"
                    : "border-[var(--feno-border-1)]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center">
                {isUploading ? (
                    <IconLoader className="size-8 mb-2 animate-spin text-[var(--feno-text-3)]" />
                ) : (
                    <IconUpload className="size-8 mb-2 text-[var(--feno-text-3)]" />
                )}

                <p className="mb-2 text-sm text-[var(--feno-text-2)]">
                    {isUploading
                        ? "Uploading..."
                        : "Drag and drop an image, or click to browse"}
                </p>

                <label htmlFor="file-upload">
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <Button
                        variant="custom"
                        size="sm"
                        className="bg-[var(--feno-interactive-resting-bg)] hover:bg-[var(--feno-interactive-hovered-bg)] border-[var(--feno-interactive-resting-border)]"
                        disabled={isUploading}
                        type="button"
                    >
                        Browse Files
                    </Button>
                </label>
            </div>
        </div>
    );
};
