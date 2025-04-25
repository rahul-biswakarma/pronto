"use client";

import { Button } from "@/libs/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouteManagement } from "../hooks/use-route-management";
import { contentVariants } from "../utils";

export const AddRoutePanel = () => {
    const { domain, newRoute, setNewRoute, handleAddRoute } =
        useRouteManagement();

    return (
        <motion.div
            className="w-full overflow-hidden px-6 flex flex-col gap-2"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                transformOrigin: "center top",
            }}
        >
            <div className="flex flex-col gap-2 text-[var(--feno-text-1)] font-medium">
                Add New Route
            </div>
            <div className="flex gap-2">
                <div className="flex items-center rounded-lg border border-[var(--feno-border-1)] bg-[var(--feno-surface-1)] overflow-hidden">
                    <code className="h-full px-3 py-1 pr-0.5 text-[var(--feno-text-1)] bg-[var(--feno-surface-0)] font-medium">
                        {domain}.feno.app/
                    </code>
                    <input
                        type="text"
                        placeholder="new-route"
                        className="flex-1 outline-none pl-1"
                        value={newRoute}
                        onChange={(e) => setNewRoute(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddRoute();
                            }
                        }}
                    />
                </div>
                <Button
                    onClick={handleAddRoute}
                    className="border border-[var(--feno-border-1)] hover:bg-[var(--feno-surface-0)]"
                    variant="custom"
                    size="icon"
                >
                    <IconPlus strokeWidth={2} />
                </Button>
            </div>
        </motion.div>
    );
};
