"use client";

import { Button } from "@/libs/ui/button";
import { IconSettings } from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { SectionActionButtonProps } from "../types";

export const SectionActionButton = ({
    open,
    setOpen,
}: SectionActionButtonProps) => (
    <Button
        onClick={() => setOpen(open ? null : "update_route")}
        variant="custom"
        size="icon"
    >
        <motion.div
            animate={{ rotate: open === "update_route" ? 180 : 0 }}
            transition={{
                duration: 0.3,
                ease: [0.19, 1.0, 0.22, 1.0],
            }}
        >
            <IconSettings strokeWidth={2} />
        </motion.div>
    </Button>
);
