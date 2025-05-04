"use client";

import { createSupabaseBrowserClient } from "@/supabase/utils";
import { supabaseOption } from "@/supabase/utils/config";
import { useEffect, useState } from "react";

type IframeEntityProps = {
    htmlVariantId: string | null;
};

export default function IframeEntity({ htmlVariantId }: IframeEntityProps) {
    const [htmlPath, setHtmlPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!htmlVariantId) {
            setError("No HTML variant ID provided");
            setIsLoading(false);
            return;
        }

        async function fetchHtmlPath() {
            try {
                setIsLoading(true);
                const supabase = createSupabaseBrowserClient(supabaseOption);

                const { data, error: fetchError } = await supabase
                    .from("website_variants")
                    .select("html_path")
                    .eq("id", htmlVariantId)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error("HTML variant not found");

                setHtmlPath(data.html_path);
            } catch (err) {
                console.error("Error fetching HTML path:", err);
                setError("Failed to load HTML content");
            } finally {
                setIsLoading(false);
            }
        }

        fetchHtmlPath();
    }, [htmlVariantId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                Loading...
            </div>
        );
    }

    if (error || !htmlPath) {
        return (
            <div className="flex items-center justify-center w-full h-full text-red-500">
                {error || "No HTML content available"}
            </div>
        );
    }

    // Construct the URL to the HTML file
    const iframeSrc = `/api/render?path=${encodeURIComponent(htmlPath)}`;

    return (
        <iframe
            src={iframeSrc}
            className="w-full h-full border-0"
            title="HTML Preview"
            sandbox="allow-scripts"
            loading="lazy"
        />
    );
}
