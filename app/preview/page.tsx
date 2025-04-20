"use client";

import { useEffect, useState } from "react";

export default function Home() {
    const [subdomain, setSubdomain] = useState<string | null>(null);

    useEffect(() => {
        const hostParts = window.location.hostname.split(".");

        // Handle localhost or simple domain (e.g., domain.com)
        if (hostParts.length < 2) {
            setSubdomain(null); // Or set a default like 'www' or 'none'
        } else {
            setSubdomain(hostParts[0]);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">
                Preview for: {subdomain ? `${subdomain}` : "No Subdomain Found"}
            </h1>
        </div>
    );
}
