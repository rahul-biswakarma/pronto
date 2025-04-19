import { cn } from "@/libs/utils/misc";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { ContentEditorMode } from "../modes/content-editor/content-editor";
import { SectionEditorMode } from "../modes/section-editor/section-editor";
import { SectionRearrangeMode } from "../modes/section-rearrange";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";
import { ProfileSettingsMode } from "../modes/user-setting/user-setting";

export const Moder = () => {
    const { modes, setModeId, registerMode, modeId, user } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        registerMode(SectionEditorMode());
        registerMode(ContentEditorMode());
        registerMode(ThemeEditorMode());
        registerMode(SectionRearrangeMode());
        registerMode(ProfileSettingsMode(user));
    }, []);

    return (
        <div className="mx-auto bg-[#eee] p-2 pb-0 rounded-3xl fixed bottom-8 left-1/2 -translate-x-1/2 min-w-[600px] max-w-[900px] max-h-fit shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#DDD] text-neutral-800">
            <motion.div
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
                    duration: 0.2,
                    ease: "easeOut",
                }}
                key={modeId}
                style={{
                    boxShadow:
                        "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 2px 2px rgba(255, 255, 255, 0.2)",
                }}
                className="bg-[#f5f5f5] rounded-2xl overflow-hidden"
            >
                {Object.values(modes)
                    .find((mode) => mode.id === modeId)
                    ?.editorRenderer()}
            </motion.div>
            <div className="w-full flex justify-center mt-1">
                {Object.values(modes).map((mode) => (
                    <motion.div
                        key={mode.id}
                        className={cn(
                            "p-1 cursor-pointer rounded-full",
                            mode.id === "profile-settings" && "ml-auto",
                        )}
                        onClick={() => setModeId(mode.id)}
                        initial={{
                            scale: 0.9,
                            opacity: 0,
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1,
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
            </div>
        </div>
    );
};
