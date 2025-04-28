"use client";

import {
    type Website,
    getWebsitePreviewHTML,
} from "@/libs/actions/website-actions";
import { Badge } from "@/libs/ui/badge";
import { Button } from "@/libs/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/libs/ui/card";
import { IconExternalLink, IconFolder } from "@tabler/icons-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";

interface WebsitePreviewCardProps {
    website: Website;
    onSelect: () => void;
}

export const WebsitePreviewCard = ({
    website,
    onSelect,
}: WebsitePreviewCardProps) => {
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    // Load the preview HTML if a route exists
    useEffect(() => {
        const loadPreview = async () => {
            if (!website.routes?.[0]?.html_file_path) return;

            try {
                setIsLoading(true);
                const result = await getWebsitePreviewHTML(
                    website.routes[0].html_file_path,
                );

                if (result.success && result.html) {
                    setPreviewHtml(result.html);
                }
            } catch (err) {
                console.error("Error loading website preview:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreview();
    }, [website.routes]);

    // Handle iframe sizing
    useEffect(() => {
        if (!iframeContainerRef.current) return;

        setContainerWidth(iframeContainerRef.current.offsetWidth);

        const handleResize = () => {
            if (iframeContainerRef.current) {
                setContainerWidth(iframeContainerRef.current.offsetWidth);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Modify HTML to make it responsive in the preview
    const responsiveStyle = `
    <style>
      html, body { width: 100vw !important; max-width: 100vw !important; overflow-x: hidden !important; }
      body { box-sizing: border-box; }
      * { max-width: 100vw !important; box-sizing: border-box; }
    </style>
  `;

    const injectedHtml =
        previewHtml && containerWidth
            ? previewHtml.replace(
                  /<head>/i,
                  `<head>${responsiveStyle}<meta name="viewport" content="width=${containerWidth}">`,
              )
            : previewHtml;

    // Format created date
    const formattedDate = website.created_at
        ? format(new Date(website.created_at), "MMM d, yyyy")
        : "Unknown date";

    // Count number of pages
    const pageCount = website.routes?.length || 0;

    // Handle visit website
    const handleVisit = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`https://${website.domain}.feno.app`, "_blank");
    };

    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={onSelect}
        >
            <div
                ref={iframeContainerRef}
                className="relative h-48 w-full bg-muted-foreground/10 border-b"
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                )}

                {!isLoading && !previewHtml && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <IconFolder className="h-12 w-12 text-muted-foreground/50" />
                        <span className="text-sm text-muted-foreground mt-2">
                            No preview available
                        </span>
                    </div>
                )}

                {injectedHtml && containerWidth && (
                    <iframe
                        title={`Preview of ${website.domain}`}
                        srcDoc={injectedHtml}
                        className="absolute inset-0 w-full h-full"
                        style={{ border: "none" }}
                    />
                )}
            </div>

            <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate">
                        {website.domain}
                    </CardTitle>
                    <Badge
                        variant={website.is_published ? "default" : "outline"}
                    >
                        {website.is_published ? "Published" : "Draft"}
                    </Badge>
                </div>
                <CardDescription>
                    {formattedDate} · {pageCount}{" "}
                    {pageCount === 1 ? "page" : "pages"}
                </CardDescription>
            </CardHeader>

            <CardFooter className="pt-2 pb-4">
                <div className="flex justify-between w-full">
                    <Button onClick={onSelect} variant="default">
                        Edit
                    </Button>
                    <Button
                        onClick={handleVisit}
                        variant="outline"
                        className="gap-1"
                    >
                        <IconExternalLink className="h-4 w-4" />
                        Visit
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
