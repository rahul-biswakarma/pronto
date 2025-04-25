"use client";
import dataLayer from "@/libs/utils/data-layer";
import { useCallback, useState } from "react";
import { useRouteContext } from "../../../context/route.context";
import type { RouteManagementHook } from "../types";

export const useRouteManagement = (): RouteManagementHook => {
    const { domain, routeMap, portfolioId, setActiveRoute, setRouteMap } =
        useRouteContext();

    const [newRoute, setNewRoute] = useState("");
    const [newDomain, setNewDomain] = useState(domain);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddRouteInput, setShowAddRouteInput] = useState(false);
    const [isAddingRoute, setIsAddingRoute] = useState(false);
    const [isDomainUpdating, setIsDomainUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [domainErrorMessage, setDomainErrorMessage] = useState<string | null>(
        null,
    );

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
    }, [newRoute, domain, portfolioId, setActiveRoute, setRouteMap]);

    const checkDomainAvailability = useCallback(
        async (domainToCheck: string) => {
            try {
                setDomainErrorMessage(null);

                const result = await dataLayer.post<{
                    success: boolean;
                    available: boolean;
                    error?: string;
                }>("/api/portfolios/check-domain", {
                    domain: domainToCheck,
                });

                return result.data.available;
            } catch (error) {
                setDomainErrorMessage(
                    "An error occurred while checking domain availability",
                );
                console.error(error);
                return false;
            }
        },
        [],
    );

    const handleUpdateDomain = useCallback(async () => {
        if (!newDomain.trim()) {
            setDomainErrorMessage("Domain name cannot be empty");
            return;
        }

        // Validate domain format (allow only lowercase letters, numbers, and hyphens)
        const domainRegex = /^[a-z0-9\-]+$/;
        if (!domainRegex.test(newDomain)) {
            setDomainErrorMessage(
                "Domain can only contain lowercase letters, numbers, and hyphens",
            );
            return;
        }

        setDomainErrorMessage(null);
        setIsDomainUpdating(true);

        try {
            // First check if the domain is available
            const isAvailable = await checkDomainAvailability(newDomain);

            if (!isAvailable) {
                setDomainErrorMessage("This domain is already taken");
                setIsDomainUpdating(false);
                return;
            }

            // Update the domain
            const result = await dataLayer.post<{
                success: boolean;
                error?: string;
            }>("/api/portfolios", {
                id: portfolioId,
                domain: newDomain,
            });

            const data = result.data;

            if (data.success) {
                // The domain was updated successfully
                // We might need to reload the page or update the context
                window.location.href = `/${newDomain}`;
            } else {
                setDomainErrorMessage(data.error || "Failed to update domain");
            }
        } catch (error) {
            setDomainErrorMessage("An unexpected error occurred");
            console.error(error);
        } finally {
            setIsDomainUpdating(false);
        }
    }, [newDomain, portfolioId, checkDomainAvailability]);

    return {
        domain,
        routes: routeMap,
        newRoute,
        setNewRoute,
        newDomain,
        setNewDomain,
        searchTerm,
        setSearchTerm,
        showAddRouteInput,
        setShowAddRouteInput,
        filteredRoutes,
        handleAddRoute,
        isAddingRoute,
        errorMessage,
        isDomainUpdating,
        domainErrorMessage,
        handleUpdateDomain,
        checkDomainAvailability,
    };
};
