import { cn } from "@/libs/utils/misc";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { SectionEditorMode } from "../modes/section-editor/section-editor";
import { SectionRearrangeMode } from "../modes/section-rearrange/section-rearrange";
import { StyleEditorMode } from "../modes/style-editor/style-editor";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";
import { ProfileSettingsMode } from "../modes/user-setting/user-setting";

export const Moder = () => {
    const { modes, setModeId, registerMode, modeId, previewMode } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (modeId === "preview") return;

        registerMode(SectionEditorMode());
        registerMode(ThemeEditorMode());
        registerMode(StyleEditorMode());
        registerMode(SectionRearrangeMode());
        registerMode(ProfileSettingsMode());
    }, []);

    return (
        <motion.div
            className="mx-auto fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#eee] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#DDD] text-neutral-800 p-1.5 pb-0 rounded-2xl max-w-[min(900px,90vw)] max-h-fit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: "bottom center" }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={modeId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-xl"
                >
                    {modes[modeId]?.editorRenderer()}
                </motion.div>
            </AnimatePresence>

            <motion.div className="w-full flex">
                <div className="flex items-center w-full">
                    {Object.values(modes).map((mode) => (
                        <motion.div
                            key={mode.id}
                            className={cn(
                                "p-1",
                                mode.id === "profile-settings" && "ml-auto",
                            )}
                            onClick={() => setModeId(mode.id)}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.1 }}
                            style={{
                                display: previewMode ? "block" : "none",
                            }}
                        >
                            {mode.actionRenderer?.(mode.id === modeId)}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
