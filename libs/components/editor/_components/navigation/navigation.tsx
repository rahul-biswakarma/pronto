"use client";
import { Button } from "@/libs/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/libs/ui/dropdown";
import {} from "@/libs/ui/popover";
import {
    IconArrowBackUp,
    IconArrowForwardUp,
    IconFile,
    IconMenu2,
    IconPlus,
    IconSearch,
    IconSettings,
    IconWorld,
    IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useEditor } from "../../editor.context";
import { containerVariants, contentVariants, headerVariants } from "./utils";

export const Navigation = () => {
    const { domain, activeRoute, routes } = useEditor();

    const [open, setOpen] = useState<null | "add_route" | "update_route">(null);
    const [newRoute, setNewRoute] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddRoute, setShowAddRoute] = useState(false);

    const handleAddRoute = useCallback(() => {
        if (newRoute.trim()) {
            // addRoute?.(newRoute);
            setNewRoute("");
        }
    }, [newRoute]);

    const filteredRoutes = Object.keys(routes).filter((route) =>
        route.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
                    <div className="flex items-center">
                        <Button
                            variant="custom"
                            size="icon"
                            className="flex gap-1 items-center"
                        >
                            <IconArrowBackUp strokeWidth={2} />
                        </Button>
                        <Button
                            variant="custom"
                            size="icon"
                            className="flex gap-1 items-center"
                        >
                            <IconArrowForwardUp strokeWidth={2} />
                        </Button>
                    </div>

                    <code className="flex items-center text-[var(--feno-text-2)] font-medium bg-[var(--feno-surface-0)] rounded-lg p-2 !py-0 pl-4 shadow-[var(--feno-minimal-shadow)]">
                        {domain}.feno.app{activeRoute}
                    </code>

                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen(open ? null : "add_route");
                                    }}
                                    className="flex items-center justify-center w-7 h-7 text-[var(--feno-text-1)] font-medium"
                                >
                                    <IconMenu2
                                        strokeWidth={2}
                                        className="w-4 h-4"
                                    />
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
                                    <div className="flex items-center gap-2 w-full text-xs border-b border-[var(--feno-border-1)] px-1 py-1 pb-2">
                                        <IconSearch
                                            strokeWidth={2}
                                            className="text-[var(--feno-text-2)] w-5 h-5"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full outline-none text-xs"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuLabel
                                    onSelect={(e) => e.preventDefault()}
                                    className="p-1 !hover:bg-transparent font-normal !pt-0"
                                >
                                    <div className="flex items-center justify-between w-full text-xs px-1">
                                        <div className="flex items-center gap-2">
                                            <IconWorld
                                                className="text-[var(--feno-text-1)] w-5 h-5"
                                                strokeWidth={2}
                                            />
                                            Routes
                                        </div>
                                        <Button
                                            variant="custom"
                                            size="icon"
                                            onClick={() =>
                                                setShowAddRoute(!showAddRoute)
                                            }
                                        >
                                            {showAddRoute ? (
                                                <IconX strokeWidth={2} />
                                            ) : (
                                                <IconPlus strokeWidth={2} />
                                            )}
                                        </Button>
                                    </div>
                                </DropdownMenuLabel>

                                {filteredRoutes.map((route) => (
                                    <DropdownMenuItem key={route}>
                                        <code className="flex items-center gap-2">
                                            <IconFile
                                                strokeWidth={2}
                                                className="w-4 h-4"
                                            />
                                            {route !== "/"
                                                ? `${route}`
                                                : "home"}
                                        </code>
                                    </DropdownMenuItem>
                                ))}

                                {showAddRoute && (
                                    <DropdownMenuLabel
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="flex items-center gap-2 w-full bg-[var(--feno-surface-1)] rounded-md shadow-[var(--feno-minimal-shadow)] overflow-hidden">
                                                <code className="flex items-center justify-center bg-[var(--feno-surface-0)] px-3 h-8 text-[14px]">
                                                    /
                                                </code>
                                                <input
                                                    type="text"
                                                    placeholder="new-route"
                                                    className="w-full h-full outline-none p-2 py-1 bg-[var(--feno-surface-1)] font-mono font-[400] truncate"
                                                />
                                                <div
                                                    onClick={handleAddRoute}
                                                    className="px-2 bg-blue-400 py-2"
                                                >
                                                    <IconPlus
                                                        className="w-4 h-4"
                                                        strokeWidth={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            onClick={() =>
                                setOpen(open ? null : "update_route")
                            }
                            variant="custom"
                            size="icon"
                        >
                            <motion.div
                                animate={{ rotate: open ? 180 : 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.19, 1.0, 0.22, 1.0],
                                }}
                            >
                                <IconSettings strokeWidth={2} />
                            </motion.div>
                        </Button>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {open === "add_route" && (
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
                                        onChange={(e) =>
                                            setNewRoute(e.target.value)
                                        }
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
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
