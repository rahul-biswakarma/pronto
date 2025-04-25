"use client";

import { cn } from "@/libs/utils/misc";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DomainDisplay } from "./components/domain-display";
import { SectionActionButton } from "./components/navigation-action-button";
import { NavigationControls } from "./components/navigation-controls";
import { RouteSettingsPanel } from "./components/route-setting-panel";
import { RoutesDropdown } from "./components/routes-dropdown";
import type { NavigationPanelType } from "./types";
import { containerVariants, headerVariants } from "./utils";

export const Navigation = () => {
    const [open, setOpen] = useState<NavigationPanelType>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setError(null);
        }
    }, [open]);

    return (
        <div className="fixed top-6 left-0 w-full flex justify-center items-start">
            <div className="flex flex-col items-center">
                <motion.div
                    className="relative flex flex-col items-center text-base feno-mod-container rounded-xl overflow-hidden shadow-[var(--feno-floating-shadow)]"
                    initial="closed"
                    animate={open ? "open" : "closed"}
                    variants={containerVariants}
                    style={{
                        transformOrigin: "center top",
                    }}
                >
                    <motion.div
                        className={cn(
                            "flex gap-4 w-full justify-center items-center p-1 px-3",
                            open === "update_route" &&
                                "border-b border-[var(--feno-border-1)]",
                        )}
                        variants={headerVariants}
                        style={{
                            transformOrigin: "center top",
                        }}
                    >
                        <NavigationControls />
                        <DomainDisplay />
                        <div className="flex items-center">
                            <RoutesDropdown open={open} setOpen={setOpen} />
                            <SectionActionButton
                                open={open}
                                setOpen={setOpen}
                            />
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {open === "update_route" && (
                            <RouteSettingsPanel setError={setError} />
                        )}
                    </AnimatePresence>
                </motion.div>
                {error && open === "update_route" && (
                    <div className="max-w-[80%] text-[12px] text-center w-full rounded-b-xl overflow-hidden bg-black/50 backdrop-blur-xl text-red-200">
                        <div className="p-0.5 bg-red-500/30">{error}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
