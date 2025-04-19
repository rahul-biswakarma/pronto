import { Button } from "@/libs/ui/button";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { ContentEditorMode } from "../modes/content-editor/content-editor";
import { PageEditorMode } from "../modes/page-editor/page-editor";
import { SectionEditorMode } from "../modes/section-editor/section-editor";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";

export const Moder = () => {
    const {
        modes,
        setModeId,
        registerMode,
        modeId,
        setPreviewMode,
        previewMode,
    } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (modeId === "preview") return;

        registerMode(SectionEditorMode());
        registerMode(ContentEditorMode());
        registerMode(ThemeEditorMode());
        registerMode(PageEditorMode());
    }, []);

    return (
        <motion.div
            layout
            className="mx-auto fixed bottom-8 left-1/2 -translate-x-1/2 border bg-accent backdrop-blur-sm p-0.5 rounded-xl max-w-[900px] max-h-fit"
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
                className="bg-background rounded-lg overflow-hidden"
            >
                {modes[modeId]?.editorRenderer()}
            </motion.div>
            <motion.div className="w-full flex justify-between" layout>
                <motion.div className="flex items-center">
                    {Object.values(modes).map((mode) => (
                        <motion.div
                            key={mode.id}
                            className="p-1"
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

                <motion.div
                    key="play"
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
                    exit={{
                        scale: 0.9,
                        opacity: 0,
                        filter: "blur(5px)",
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}
                    style={{
                        padding: previewMode ? "4px" : "0px",
                    }}
                    onClick={() => {
                        setPreviewMode(!previewMode);
                        previewMode
                            ? setModeId("preview")
                            : setModeId("section-editor");
                    }}
                >
                    <Button
                        variant="default"
                        size="icon"
                        className="text-background bg-foreground rounded-lg cursor-pointer hover:bg-foreground p-0.5 h-8 w-8"
                    >
                        <Play size={16} />
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
