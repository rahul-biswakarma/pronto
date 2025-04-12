"use client";

import { useEffect, useState } from "react";

/**
 * CSRF Provider - Automatically adds CSRF tokens to all fetch requests
 * This should be included near the top of your app layout
 */
export const CSRFProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isPatched, setIsPatched] = useState(false);

    useEffect(() => {
        // Don't patch multiple times
        if (isPatched) return;

        // Store the original fetch function
        const originalFetch = window.fetch;

        // Override the global fetch function to add CSRF tokens
        window.fetch = async (resource, options) => {
            // Only add token for state-changing methods
            const method = options?.method?.toUpperCase() || "GET";

            // Create a new init object to avoid mutating the original
            const newOptions = options ? { ...options } : {};

            if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
                try {
                    // Get CSRF token from the endpoint
                    const tokenResponse = await originalFetch("/api/csrf", {
                        method: "GET",
                        credentials: "include",
                    });

                    if (tokenResponse.ok) {
                        const tokenData = await tokenResponse.json();
                        const csrfToken = tokenData.csrfToken;

                        // Create headers if they don't exist
                        const headers = newOptions.headers
                            ? new Headers(newOptions.headers)
                            : new Headers();

                        // Add CSRF token to headers
                        headers.set("x-csrf-token", csrfToken);

                        // Update headers in the new options object
                        newOptions.headers = headers;
                    }
                } catch (error) {
                    console.error("Failed to get CSRF token", error);
                }
            }

            // Call the original fetch with updated options
            return originalFetch(resource, newOptions);
        };

        setIsPatched(true);

        // Cleanup function to restore original fetch
        return () => {
            window.fetch = originalFetch;
        };
    }, [isPatched]);

    return <>{children}</>;
};

export default CSRFProvider;
