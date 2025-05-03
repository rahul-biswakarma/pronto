"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

type RouteContextType = {
    domain: string;
    currentRoute: string;
    setCurrentRoute: (route: string) => void;
    routes: string[];
    addRoute: (route: string) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({
    children,
    domain,
    currentRoute = "/",
}: {
    children: ReactNode;
    domain: string;
    currentRoute?: string;
}) {
    const [routes, setRoutes] = useState<string[]>([currentRoute]);
    const [activeRoute, setActiveRoute] = useState<string>(currentRoute);

    const addRoute = (route: string) => {
        if (!routes.includes(route)) {
            setRoutes([...routes, route]);
        }
    };

    return (
        <RouteContext.Provider
            value={{
                domain,
                currentRoute: activeRoute,
                setCurrentRoute: setActiveRoute,
                routes,
                addRoute,
            }}
        >
            {children}
        </RouteContext.Provider>
    );
}

export function useRoute() {
    const context = useContext(RouteContext);
    if (context === undefined) {
        throw new Error("useRoute must be used within a RouteProvider");
    }
    return context;
}
