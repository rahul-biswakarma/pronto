"use client";

import { createSupabaseBrowserClient } from "@/supabase/utils";
import { supabaseOption } from "@/supabase/utils/config";
import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { CanvasEntityType } from "../utils/entity.types";
import { useRoute } from "./route.context";

type CanvasEntity = {
    id: string;
    entity_type: CanvasEntityType;
    content: string | null;
    html_variant_id: string | null;
    x: number;
    y: number;
    width: number | null;
    height: number | null;
    created_by: string;
};

type CanvasContextType = {
    entities: CanvasEntity[];
    selectedEntityId: string | null;
    scale: number;
    position: { x: number; y: number };
    isLoading: boolean;
    error: string | null;
    addEntity: (
        entity: Omit<CanvasEntity, "id" | "created_by">,
    ) => Promise<void>;
    updateEntity: (id: string, updates: Partial<CanvasEntity>) => Promise<void>;
    deleteEntity: (id: string) => Promise<void>;
    selectEntity: (id: string | null) => void;
    setScale: (scale: number) => void;
    setPosition: (position: { x: number; y: number }) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const { websiteId, isLoading: isRouteLoading } = useRoute();
    const [entities, setEntities] = useState<CanvasEntity[]>([]);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
        null,
    );
    const [scale, setScale] = useState<number>(1);
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createSupabaseBrowserClient(supabaseOption);

    useEffect(() => {
        if (!websiteId || isRouteLoading) return;

        async function fetchCanvasEntities() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch all canvas entities for this website
                const { data, error: entitiesError } = await supabase
                    .from("canvas_entities")
                    .select("*")
                    .eq("html_variant_id", websiteId);

                if (entitiesError) throw entitiesError;

                setEntities(data || []);
            } catch (err) {
                console.error("Error fetching canvas entities:", err);
                setError("Failed to load canvas data");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCanvasEntities();
    }, [websiteId, isRouteLoading]);

    const addEntity = async (
        entity: Omit<CanvasEntity, "id" | "created_by">,
    ) => {
        try {
            const { data, error: insertError } = await supabase
                .from("canvas_entities")
                .insert(entity)
                .select()
                .single();

            if (insertError) throw insertError;
            if (data) {
                setEntities((prev) => [...prev, data]);
            }
        } catch (err) {
            console.error("Error adding entity:", err);
            setError("Failed to add entity");
        }
    };

    const updateEntity = async (id: string, updates: Partial<CanvasEntity>) => {
        try {
            const { error: updateError } = await supabase
                .from("canvas_entities")
                .update(updates)
                .eq("id", id);

            if (updateError) throw updateError;

            setEntities((prev) =>
                prev.map((entity) =>
                    entity.id === id ? { ...entity, ...updates } : entity,
                ),
            );
        } catch (err) {
            console.error("Error updating entity:", err);
            setError("Failed to update entity");
        }
    };

    const deleteEntity = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from("canvas_entities")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            setEntities((prev) => prev.filter((entity) => entity.id !== id));
            if (selectedEntityId === id) {
                setSelectedEntityId(null);
            }
        } catch (err) {
            console.error("Error deleting entity:", err);
            setError("Failed to delete entity");
        }
    };

    const selectEntity = (id: string | null) => {
        setSelectedEntityId(id);
    };

    const value = {
        entities,
        selectedEntityId,
        scale,
        position,
        isLoading,
        error,
        supabase,
        addEntity,
        updateEntity,
        deleteEntity,
        selectEntity,
        setScale,
        setPosition,
    };

    return (
        <CanvasContext.Provider value={value}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const context = useContext(CanvasContext);
    if (context === undefined) {
        throw new Error("useCanvas must be used within a CanvasProvider");
    }
    return context;
}
