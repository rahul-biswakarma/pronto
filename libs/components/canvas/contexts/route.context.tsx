"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

type Route = {
    id: string;
    path: string;
    website_id: string;
};

type RouteContextType = {
    currentDomain: string;
    currentPath: string;
    routes: Route[];
    websiteId: string;
    isLoading: boolean;
    error: string | null;
    setCurrentPath: (path: string) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({
    children,
    domain,
    initialRoutes,
    initialWebsiteId,
}: {
    children: ReactNode;
    domain: string;
    initialRoutes: Route[];
    initialWebsiteId: string;
}) {
    const [currentDomain] = useState<string>(domain);
    const [currentPath, setCurrentPath] = useState<string>("/");
    const [routes] = useState<Route[]>(initialRoutes);
    const [websiteId] = useState<string>(initialWebsiteId);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // We're using the data passed from the server component
    // This avoids additional API calls on the client side

    const value = {
        currentDomain,
        currentPath,
        routes,
        websiteId,
        isLoading,
        error,
        setCurrentPath,
    };

    return (
        <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
    );
}

export function useRoute() {
    const context = useContext(RouteContext);
    if (context === undefined) {
        throw new Error("useRoute must be used within a RouteProvider");
    }
    return context;
}
