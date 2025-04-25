"use client";

import { useCallback, useState } from "react";
import { useEditor } from "../../../editor.context";
import type { RouteManagementHook } from "../types";

export const useRouteManagement = (): RouteManagementHook => {
    const { domain, routes } = useEditor();
    const [newRoute, setNewRoute] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddRouteInput, setShowAddRouteInput] = useState(false);

    const filteredRoutes = Object.keys(routes).filter((route) =>
        route.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleAddRoute = useCallback(() => {
        if (newRoute.trim()) {
            // Add route functionality would go here
            // addRoute?.(newRoute);
            setNewRoute("");
        }
    }, [newRoute]);

    return {
        domain,
        routes,
        newRoute,
        setNewRoute,
        searchTerm,
        setSearchTerm,
        showAddRouteInput,
        setShowAddRouteInput,
        filteredRoutes,
        handleAddRoute,
    };
};
