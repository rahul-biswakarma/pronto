"use client";

import dataLayer from "@/libs/utils/data-layer";
import { useEffect, useState } from "react";

export default function Home() {
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const hostParts = window.location.hostname.split(".");

        // Handle localhost or simple domain (e.g., domain.com)
        if (hostParts.length < 2) {
            setSubdomain(null); // Or set a default like 'www' or 'none'
        } else {
            setSubdomain(hostParts[0]);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        const fetchPortfolioUrl = async () => {
            if (subdomain) {
                setIsLoading(true);
                setError(null);
                try {
                    const res = await dataLayer.get("/api/portfolio", {
                        params: {
                            domain: subdomain,
                        },
                    });
                    if (res.data?.htmlUrl) {
                        setHtmlUrl(res.data.htmlUrl);
                    } else {
                        setError("Portfolio URL not found.");
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error("Failed to fetch portfolio URL:", err);
                    setError("Failed to load portfolio data.");
                    setIsLoading(false);
                }
            } else if (subdomain === null) {
                setError("No subdomain specified for preview.");
                setIsLoading(false);
            }
        };

        fetchPortfolioUrl();
    }, [subdomain]);

    useEffect(() => {
        const fetchHtmlContent = async () => {
            if (htmlUrl) {
                setError(null);
                try {
                    const response = await fetch(htmlUrl);
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`,
                        );
                    }
                    const textContent = await response.text();
                    setHtmlContent(textContent);
                } catch (err) {
                    console.error("Failed to fetch HTML content:", err);
                    setError("Failed to load portfolio content.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchHtmlContent();
    }, [htmlUrl]);

    if (isLoading) {
        return <p>Loading preview...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!htmlContent) {
        return <p>No content available.</p>;
    }

    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
