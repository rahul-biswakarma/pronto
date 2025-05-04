"use client";

import { useState } from "react";

type UrlEntityProps = {
    url: string | null;
};

export default function UrlEntity({ url }: UrlEntityProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!url) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                No URL provided
            </div>
        );
    }

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setError("Failed to load URL");
    };

    return (
        <div className="w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                    Loading...
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white text-red-500">
                    {error}
                </div>
            )}
            <iframe
                src={url}
                className="w-full h-full border-0"
                title="URL Preview"
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}
