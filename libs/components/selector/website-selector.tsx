"use client";

import { type Website, getUserWebsites } from "@/libs/actions/website-actions";
import { Button } from "@/libs/ui/button";
import { IconPlus, IconWorld } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WebsitePreviewCard } from "./website-preview-card";

export const WebsiteSelector = () => {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch websites on mount
    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const result = await getUserWebsites();

                if (!result.success || !result.websites) {
                    setError(result.error || "Failed to load websites");
                    return;
                }

                setWebsites(result.websites);
            } catch (err) {
                console.error("Error fetching websites:", err);
                setError("An unexpected error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWebsites();
    }, []);

    // Handle create new website button click
    const handleCreateNew = () => {
        router.push("/create-website");
    };

    // Handle website selection
    const handleSelectWebsite = (websiteId: string, domain: string) => {
        router.push(`/editor/${domain}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold">My Websites</h1>
                <Button onClick={handleCreateNew}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create New Website
                </Button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            )}

            {error && (
                <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-6">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && websites.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-60 bg-muted/20 rounded-lg border border-border">
                    <IconWorld className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                        No websites yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Create your first website to get started
                    </p>
                    <Button onClick={handleCreateNew}>Create Website</Button>
                </div>
            )}

            {!isLoading && websites.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {websites.map((website) => (
                        <WebsitePreviewCard
                            key={website.id}
                            website={website}
                            onSelect={() =>
                                handleSelectWebsite(website.id, website.domain)
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
