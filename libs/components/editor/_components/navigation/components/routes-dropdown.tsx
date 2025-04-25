"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/libs/ui/dropdown";
import { IconMenu2 } from "@tabler/icons-react";
import { useRouteContext } from "../../../context/route.context";
import { useRouteManagement } from "../hooks/use-route-management";
import type { RoutesDropdownProps } from "../types";
import { AddRouteInput } from "./add-route-input";
import { RouteListItem } from "./route-list-item";
import { RouteMenuHeader } from "./route-menu-header";
import { RouteSearchInput } from "./route-search-input";

export const RoutesDropdown = ({ open, setOpen }: RoutesDropdownProps) => {
    const { activeRoute } = useRouteContext();

    const {
        searchTerm,
        setSearchTerm,
        filteredRoutes,
        showAddRouteInput,
        setShowAddRouteInput,
        newRoute,
        setNewRoute,
        handleAddRoute,
        isAddingRoute,
        errorMessage,
    } = useRouteManagement();

    return (
        <DropdownMenu
            open={open === "add_route"}
            onOpenChange={(isOpen) => setOpen(isOpen ? "add_route" : null)}
        >
            <DropdownMenuTrigger className="outline-none">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="flex items-center justify-center w-7 h-7 text-[var(--feno-text-1)] font-medium"
                >
                    <IconMenu2 strokeWidth={2} className="w-4 h-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="border-none !shadow-[var(--feno-minimal-shadow)] bg-[var(--feno-surface-0)] max-w-[250px] min-w-[250px] w-[250px]"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenuLabel
                    onSelect={(e) => e.preventDefault()}
                    className="px-1 pt-0 !hover:bg-transparent font-normal"
                >
                    <RouteSearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </DropdownMenuLabel>

                <DropdownMenuLabel
                    onSelect={(e) => e.preventDefault()}
                    className="p-1 !hover:bg-transparent font-normal !pt-0"
                >
                    <RouteMenuHeader
                        showAddRouteInput={showAddRouteInput}
                        onToggleAddRoute={() =>
                            setShowAddRouteInput(!showAddRouteInput)
                        }
                    />
                </DropdownMenuLabel>

                {filteredRoutes.map((route) => (
                    <RouteListItem
                        key={route}
                        route={route}
                        isActive={activeRoute === route}
                    />
                ))}

                {showAddRouteInput && (
                    <DropdownMenuLabel onSelect={(e) => e.preventDefault()}>
                        <AddRouteInput
                            value={newRoute}
                            onChange={setNewRoute}
                            onAdd={handleAddRoute}
                            isLoading={isAddingRoute}
                        />
                        {errorMessage && (
                            <p className="text-red-500 text-xs mt-1 px-2">
                                {errorMessage}
                            </p>
                        )}
                    </DropdownMenuLabel>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
