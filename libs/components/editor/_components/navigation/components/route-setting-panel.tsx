"use client";

import { Button } from "@/libs/ui/button";

import { cn } from "@/libs/utils/misc";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouteManagement } from "../hooks/use-route-management";
import { contentVariants } from "../utils";

export const RouteSettingsPanel = ({
    setError,
}: {
    setError: (error: string) => void;
}) => {
    const {
        domain,
        newDomain,
        setNewDomain,
        handleUpdateDomain,
        isDomainUpdating,
        domainErrorMessage,
        checkDomainAvailability,
    } = useRouteManagement();

    useEffect(() => {
        if (domainErrorMessage) {
            setError(domainErrorMessage);
        }
    }, [domainErrorMessage, setError]);

    // Reset newDomain when domain changes
    useEffect(() => {
        setNewDomain(domain);
    }, [domain, setNewDomain]);

    // Validate domain on change with debounce
    useEffect(() => {
        if (newDomain === domain) return;

        const timer = setTimeout(() => {
            if (newDomain.trim() && newDomain !== domain) {
                checkDomainAvailability(newDomain);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [newDomain, domain, checkDomainAvailability]);

    return (
        <motion.div
            className="relative w-full overflow-hidden p-4 flex flex-col gap-4 bg-[var(--feno-surface-0)]"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                transformOrigin: "center top",
            }}
        >
            {/* Domain Management Section */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 text-[var(--feno-text-1)] font-medium">
                    Update Domain
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center rounded-lg border border-[var(--feno-border-1)] bg-[var(--feno-surface-1)] overflow-hidden">
                        <input
                            type="text"
                            placeholder="your-domain"
                            className={cn(
                                "flex-1 h-full px-3 py-1 outline-none font-mono font-medium",
                            )}
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUpdateDomain();
                                }
                            }}
                        />
                        <code className="h-full px-3 py-1 pl-0.5 text-[var(--feno-text-1)] bg-[var(--feno-surface-0)] font-medium">
                            .feno.app
                        </code>
                    </div>
                    <Button
                        onClick={handleUpdateDomain}
                        className="border border-[var(--feno-border-1)] hover:bg-[var(--feno-surface-0)]"
                        variant="custom"
                        size="icon"
                        disabled={
                            isDomainUpdating ||
                            domain === newDomain ||
                            !!domainErrorMessage
                        }
                    >
                        {isDomainUpdating ? (
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <IconCheck strokeWidth={2} />
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
