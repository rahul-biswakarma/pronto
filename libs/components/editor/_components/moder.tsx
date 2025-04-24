import { cn } from "@/libs/utils/misc";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { ContentEditorMode } from "../modes/content-editor";
import { DeploymentMode } from "../modes/deployment/deployment";
import { PageEditorMode } from "../modes/page-editor/page-editor";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";
import { ProfileSettingsMode } from "../modes/user-setting/user-setting";

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: "easeOut",
            when: "beforeChildren",
            staggerChildren: 0.03,
        },
    },
    exit: {
        opacity: 0,
        y: 10,
        transition: { duration: 0.15, ease: "easeInOut" },
    },
};

const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.15, ease: "easeInOut" },
    },
};

const modeButtonVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
        opacity: 1,
        transition: {
            delay: custom * 0.03,
            duration: 0.15,
            ease: "easeOut",
        },
    }),
};

export const Moder = () => {
    const { modes, setModeId, registerMode, modeId, previewMode } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        registerMode(PageEditorMode());
        registerMode(ContentEditorMode());
        registerMode(ThemeEditorMode());
        registerMode(DeploymentMode());
        registerMode(ProfileSettingsMode());
    }, []);

    const handleModeClick = (id: string) => {
        // If clicking on the already active mode, deselect it
        if (id === modeId) {
            setModeId("");
        } else {
            setModeId(id);
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <motion.div
                className={cn(
                    "mx-auto fixed bottom-8 feno-font-wrapper left-1/2 -translate-x-1/2 bg-[var(--feno-surface-2)] shadow-[var(--feno-floating-shadow)] border border-[var(--feno-border-1)] p-1.5 pb-0 rounded-2xl max-w-[min(900px,90vw)] max-h-fit",
                    {
                        "pb-1.5": !modeId,
                    },
                )}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                layoutId="moder-container"
                layout="position"
                style={{ transformOrigin: "bottom center" }}
            >
                <AnimatePresence mode="wait">
                    {modeId && (
                        <motion.div
                            key={`content-${modeId}`}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout="position"
                            className="rounded-xl overflow-hidden"
                        >
                            {modes[modeId]?.editorRenderer()}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="w-full flex"
                    layout="position"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <div className="flex items-center w-full gap-1">
                        {Object.values(modes).map((mode, index) => (
                            <motion.div
                                key={mode.id}
                                className={cn(
                                    modeId !== "" && "py-1.5",
                                    mode.id === "deployment" && "ml-auto",
                                    mode.id === "deployment" &&
                                        modeId === "" &&
                                        "ml-2 border-l border-[var(--feno-border-1)] pl-5",
                                )}
                                onClick={() => handleModeClick(mode.id)}
                                variants={modeButtonVariants}
                                custom={index}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                layout="position"
                                transition={{
                                    duration: 0.15,
                                    ease: "easeOut",
                                }}
                                style={{
                                    display: previewMode ? "block" : "none",
                                    originX: 0.5,
                                    originY: 0.5,
                                }}
                            >
                                {mode.actionRenderer?.(mode.id === modeId)}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
};
