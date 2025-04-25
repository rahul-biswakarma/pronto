"use client";
import dataLayer from "@/libs/utils/data-layer";
import { useCallback, useState } from "react";
import { useRouteContext } from "../../../context/route.context";
import type { RouteManagementHook } from "../types";

export const useRouteManagement = (): RouteManagementHook => {
    const { domain, routeMap, portfolioId, setActiveRoute, setRouteMap } =
        useRouteContext();

    const [newRoute, setNewRoute] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddRouteInput, setShowAddRouteInput] = useState(false);
    const [isAddingRoute, setIsAddingRoute] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const filteredRoutes = Object.keys(routeMap).filter((route) =>
        route.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleAddRoute = useCallback(async () => {
        if (!newRoute.trim()) {
            setErrorMessage("Route name cannot be empty");
            return;
        }

        setErrorMessage(null);
        setIsAddingRoute(true);

        try {
            const result = await dataLayer.post<{
                success: boolean;
                error?: string;
            }>("/api/portfolios/create-route", {
                url: newRoute,
                domain,
                portfolioId: portfolioId,
            });

            const data = result.data;

            if (data.success) {
                setNewRoute("");
                setRouteMap((prev) => ({
                    ...prev,
                    [`/${newRoute}`]: "",
                }));
                setActiveRoute(newRoute);
                // Keep dropdown open but hide the input after successful add
                setShowAddRouteInput(false);
            } else {
                setErrorMessage(data.error || "Failed to create route");
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred");
            console.error(error);
        } finally {
            setIsAddingRoute(false);
        }
    }, [newRoute, domain, portfolioId, setActiveRoute]);

    return {
        domain,
        routes: routeMap,
        newRoute,
        setNewRoute,
        searchTerm,
        setSearchTerm,
        showAddRouteInput,
        setShowAddRouteInput,
        filteredRoutes,
        handleAddRoute,
        isAddingRoute,
        errorMessage,
    };
};
