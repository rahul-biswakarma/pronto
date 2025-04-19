import { motion } from "framer-motion";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { ContentEditorMode } from "../modes/content-editor/content-editor";
import { SectionEditorMode } from "../modes/section-editor/section-editor";
import { SectionRearrangeMode } from "../modes/section-rearrange";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";

export const Moder = () => {
    const { modes, setModeId, registerMode, modeId } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        registerMode(SectionEditorMode());
        registerMode(ContentEditorMode());
        registerMode(ThemeEditorMode());
        registerMode(SectionRearrangeMode());
    }, []);

    return (
        <motion.div
            layout
            className="mx-auto bg-[#eee] p-2 rounded-3xl fixed bottom-8 left-1/2 -translate-x-1/2 max-w-[900px] max-h-fit shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#DDD] text-neutral-800"
            style={{
                transformOrigin: "bottom center",
                willChange: "transform",
            }}
            transition={{
                layout: {
                    duration: 0.2,
                    ease: "easeOut",
                },
            }}
            animate={{
                scale: 1,
                filter: "blur(0px)",
                originX: 0.5,
                originY: 1,
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
                        duration: 0.2,
                        ease: "easeOut",
                    },
                }}
                key={modeId}
                style={{
                    originY: 1,
                    willChange: "transform",
                    boxShadow:
                        "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 2px 2px rgba(255, 255, 255, 0.2)",
                    transformOrigin: "bottom center",
                }}
                className="bg-[#f5f5f5] rounded-2xl overflow-hidden"
            >
                {Object.values(modes)
                    .find((mode) => mode.id === modeId)
                    ?.editorRenderer()}
            </motion.div>
            <motion.div className="w-full flex justify-center mt-1" layout>
                {Object.values(modes).map((mode) => (
                    <motion.div
                        key={mode.id}
                        className={"p-1 rounded-full cursor-pointer"}
                        onClick={() => setModeId(mode.id)}
                        layout
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
                        whileHover={{
                            scale: 1.05,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                    >
                        {mode.actionRenderer?.(mode.id === modeId)}
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};
