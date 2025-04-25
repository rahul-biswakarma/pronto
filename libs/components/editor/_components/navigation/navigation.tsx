"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AddRoutePanel } from "./components/add-route-panel";
import { DomainDisplay } from "./components/domain-display";
import { NavigationActionButton } from "./components/navigation-action-button";
import { NavigationControls } from "./components/navigation-controls";
import { RoutesDropdown } from "./components/routes-dropdown";
import type { NavigationPanelType } from "./types";
import { containerVariants, headerVariants } from "./utils";

export const Navigation = () => {
    const [open, setOpen] = useState<NavigationPanelType>(null);

    return (
        <div className="fixed top-6 left-0 w-full flex justify-center items-start">
            <motion.div
                className="flex flex-col items-center gap-2 text-base feno-mod-container shadow-[var(--feno-floating-shadow)]"
                initial="closed"
                animate={open ? "open" : "closed"}
                variants={containerVariants}
                style={{
                    transformOrigin: "center top",
                }}
            >
                <motion.div
                    className="flex gap-4 w-full justify-center items-center p-1 px-3"
                    variants={headerVariants}
                    style={{
                        transformOrigin: "center top",
                    }}
                >
                    <NavigationControls />
                    <DomainDisplay />
                    <div className="flex items-center">
                        <RoutesDropdown open={open} setOpen={setOpen} />
                        <NavigationActionButton open={open} setOpen={setOpen} />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {open === "add_route" && <AddRoutePanel />}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
