import { cn } from "@/libs/utils/misc";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { SectionEditorMode } from "../modes/section-editor/section-editor";
import { SectionRearrangeMode } from "../modes/section-rearrange/section-rearrange";
import { StyleEditorMode } from "../modes/style-editor/style-editor";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";
import { ProfileSettingsMode } from "../modes/user-setting/user-setting";

export const Moder = () => {
    const { modes, setModeId, registerMode, modeId, previewMode, user } =
        useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (modeId === "preview") return;

        registerMode(SectionEditorMode());
        registerMode(ThemeEditorMode());
        registerMode(StyleEditorMode());
        registerMode(SectionRearrangeMode());
        registerMode(ProfileSettingsMode(user));
    }, []);

    return (
        <motion.div
            layout
            className="mx-auto fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#eee] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#DDD] text-neutral-800 p-1.5 pb-0 rounded-2xl max-w-[min(900px,90vw)] max-h-fit"
            style={{
                transformOrigin: "bottom center",
                willChange: "transform",
            }}
        >
            <motion.div
                layout
                initial={{
                    scale: 0.9,
                    opacity: 0,
                    filter: "blur(5px)",
                    originX: 0.5,
                    originY: 1,
                }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    originX: 0.5,
                    originY: 1,
                }}
                exit={{
                    scale: 0.9,
                    opacity: 0,
                    filter: "blur(5px)",
                    originX: 0.5,
                    originY: 1,
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                    layout: {
                        duration: 0.1,
                        ease: "easeOut",
                        originY: 1,
                    },
                    opacity: {
                        value: 1,
                        delay: 0.3,
                        duration: 0.2,
                        ease: "easeOut",
                    },
                }}
                key={modeId}
                style={{
                    originY: 1,
                    willChange: "transform",
                    transformOrigin: "bottom center",
                }}
                className="rounded-xl overflow-hidden"
            >
                {modes[modeId]?.editorRenderer()}
            </motion.div>
            <motion.div className="w-full flex" layout>
                <motion.div className="flex items-center w-full">
                    {Object.values(modes).map((mode) => (
                        <motion.div
                            key={mode.id}
                            className={cn(
                                "p-1",
                                mode.id === "profile-settings" && "ml-auto",
                            )}
                            onClick={() => setModeId(mode.id)}
                            layout
                            style={{
                                display: previewMode ? "block" : "none",
                            }}
                            initial={{
                                scale: 0.9,
                                opacity: 0,
                                filter: "blur(5px)",
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                filter: "blur(0px)",
                            }}
                            transition={{
                                duration: 0.1,
                                ease: "easeOut",
                            }}
                        >
                            {mode.actionRenderer?.(mode.id === modeId)}
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
