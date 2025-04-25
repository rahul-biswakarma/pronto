import type { Dispatch, SetStateAction } from "react";

export type NavigationPanelType = null | "add_route" | "update_route";

export interface RouteSearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export interface RouteListItemProps {
    route: string;
}

export interface AddRouteInputProps {
    value: string;
    onChange: (value: string) => void;
    onAdd: () => void;
    isLoading?: boolean;
}

export interface RouteMenuHeaderProps {
    showAddRouteInput: boolean;
    onToggleAddRoute: () => void;
}

export interface RoutesDropdownProps {
    open: NavigationPanelType;
    setOpen: Dispatch<SetStateAction<NavigationPanelType>>;
}

export interface SectionActionButtonProps {
    open: NavigationPanelType;
    setOpen: Dispatch<SetStateAction<NavigationPanelType>>;
}

export interface RouteManagementHook {
    domain: string;
    routes: Record<string, string>;
    newRoute: string;
    setNewRoute: Dispatch<SetStateAction<string>>;
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    showAddRouteInput: boolean;
    setShowAddRouteInput: Dispatch<SetStateAction<boolean>>;
    filteredRoutes: string[];
    handleAddRoute: () => void;
    isAddingRoute: boolean;
    errorMessage: string | null;
}
