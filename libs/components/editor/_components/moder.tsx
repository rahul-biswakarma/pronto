import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";
export const Moder = () => {
    const { modes, setModeId, registerMode } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        registerMode(ThemeEditorMode());
    }, []);

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl p-1 bg-background rounded-xl border-4 border-stone-300/50">
            <div className="flex flex-col space-y-2">
                {Object.values(modes).map((mode) => (
                    <div key={mode.id}>{mode.editorRenderer()}</div>
                ))}
            </div>
            <div className="flex gap-2 pt-4">
                {Object.values(modes).map((mode) => (
                    <div key={mode.id} onClick={() => setModeId(mode.id)}>
                        {mode.actionRenderer?.()}
                    </div>
                ))}
            </div>
        </div>
    );
};
