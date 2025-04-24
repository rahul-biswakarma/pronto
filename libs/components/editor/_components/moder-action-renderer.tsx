import { Button } from "@/libs/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/libs/ui/tooltip";
import { cn } from "@/libs/utils/misc";
import { motion } from "framer-motion";

export const ModerActionRenderer = ({
    icon,
    label,
    active,
}: {
    icon: React.ElementType;
    label: string;
    active: boolean;
}) => {
    const Icon = icon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{
                        backgroundColor: active
                            ? "var(--feno-surface-1)"
                            : "transparent",
                        scale: active ? 1.02 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >
                    <Button
                        size="icon"
                        variant="custom"
                        className={cn(
                            "rounded-lg cursor-pointer hover:bg-background p-0 [&_svg:not([class*='size-'])]:size-[17px] [&_svg]:stroke-[1.8]",
                            active && "bg-[var(--feno-surface-1)]",
                        )}
                    >
                        <motion.div
                            animate={{
                                scale: active ? 1.05 : 1,
                                color: active
                                    ? "var(--feno-primary)"
                                    : "currentColor",
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                        >
                            <Icon size={16} />
                        </motion.div>
                    </Button>
                </motion.div>
            </TooltipTrigger>
            <TooltipContent>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {label}
                </motion.div>
            </TooltipContent>
        </Tooltip>
    );
};
