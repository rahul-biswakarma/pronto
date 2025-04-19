import { motion } from "framer-motion";
import { useEditor } from "../editor.context";
import { UserSettings } from "../modes/user-setting/user-setting";

export const Navigation = () => {
    const { previewMode } = useEditor();

    return (
        <motion.div
            className="flex items-center gap-2 fixed top-4 left-1/2 -translate-x-1/2 mx-auto text-base"
            style={{
                willChange: "transform",
            }}
            animate={{
                y: previewMode ? 0 : -200,
            }}
            transition={{
                duration: 0.3,
                ease: "easeOut",
            }}
        >
            <div className="flex bg-accent rounded-full p-1">
                <div className="bg-background rounded-full px-3 py-1">
                    feno.app/
                </div>
                <input className="outline-none px-2" type="text" />
            </div>

            <UserSettings />
        </motion.div>
    );
};
