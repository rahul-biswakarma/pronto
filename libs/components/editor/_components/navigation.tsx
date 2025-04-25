"use client";
import { Button } from "@/libs/ui/button";
import {} from "@/libs/ui/popover";
import {
    IconArrowBackUp,
    IconArrowForwardUp,
    IconPlus,
    IconSettings,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useEditor } from "../editor.context";

export const Navigation = () => {
    const { domain, activeRoute } = useEditor();

    const [open, setOpen] = useState(false);

    const containerVariants = {
        closed: {
            width: "auto",
            borderBottom: "0px solid rgba(0, 0, 0, 0)",
            transition: {
                width: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
                borderBottom: { duration: 0.1, delay: 0 },
            },
        },
        open: {
            width: "500px",
            borderBottom: "1px solid var(--feno-border-1)",
            transition: {
                width: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
                borderBottom: { duration: 0.1, delay: 0.2 },
            },
        },
    };

    const headerVariants = {
        closed: {
            borderBottom: "0px solid rgba(0, 0, 0, 0)",
            transition: {
                duration: 0.1,
                delay: 0,
            },
        },
        open: {
            borderBottom: "1px solid var(--feno-border-1)",
            transition: {
                duration: 0.1,
                delay: 0.2,
            },
        },
    };

    const contentVariants = {
        initial: {
            height: 0,
            opacity: 0,
            marginTop: 0,
            marginBottom: 0,
            transformOrigin: "center top",
            scaleY: 0.8,
        },
        animate: {
            height: "auto",
            opacity: 1,
            marginTop: 8,
            marginBottom: 8,
            transformOrigin: "center top",
            scaleY: 1,
            transition: {
                height: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
                opacity: { duration: 0.3, delay: 0.1, ease: "easeInOut" },
                margin: { duration: 0.2, delay: 0.1 },
                scaleY: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
            },
        },
        exit: {
            height: 0,
            opacity: 0,
            marginTop: 0,
            marginBottom: 0,
            transformOrigin: "center top",
            scaleY: 0.8,
            transition: {
                height: { duration: 0.2, ease: [0.19, 1.0, 0.22, 1.0] },
                opacity: { duration: 0.15, ease: "easeInOut" },
                margin: { duration: 0.1 },
                scaleY: { duration: 0.2, ease: [0.19, 1.0, 0.22, 1.0] },
            },
        },
    };

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
                    className="flex w-full justify-center items-center p-2 px-3"
                    variants={headerVariants}
                    style={{
                        transformOrigin: "center top",
                    }}
                >
                    <div className="flex gap-1.5 items-center mr-7">
                        <Button
                            variant="custom"
                            size="icon"
                            className="flex gap-1 items-center"
                        >
                            <IconArrowBackUp strokeWidth={2} />
                            <IconArrowForwardUp strokeWidth={2} />
                        </Button>
                    </div>
                    {/* <code className="text-blue-600 font-medium border border-dashed border-[var(--feno-border-2)] rounded-md px-1">
                        {domain}
                    </code> */}
                    <code className="text-[var(--feno-text-2)] font-medium">
                        {domain}.feno.app{activeRoute}
                    </code>
                    {/* <code className="text-blue-600 font-medium border border-dashed border-[var(--feno-border-2)] rounded-md px-1">
                        {activeRoute}
                    </code> */}
                    <Button variant="custom" size="icon" className="-ml-1">
                        <IconPlus strokeWidth={2} />
                    </Button>
                    <Button
                        onClick={() => setOpen(!open)}
                        variant="custom"
                        size="icon"
                        className="ml-3"
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
                </motion.div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            className="w-full overflow-hidden px-6"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={{
                                transformOrigin: "center top",
                            }}
                        >
                            hello
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
