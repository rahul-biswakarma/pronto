import { useEffect } from "react";
import { useEditor } from "../editor.context";
import { ContentEditorMode } from "../modes/content-editor/content-editor";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";

export const Moder = () => {
    const { modes, setModeId, registerMode, modeId } = useEditor();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        registerMode(ThemeEditorMode());
        registerMode(ContentEditorMode());
    }, []);

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl p-1 rounded-2xl bg-background/30 backdrop-blur-2xl border border-stone-300/50  saturate-200">
            <div className="flex flex-col space-y-2 p-2 bg-background rounded-xl">
                {Object.values(modes)
                    .find((mode) => mode.id === modeId)
                    ?.editorRenderer()}
            </div>
            <div className="flex gap-2">
                {Object.values(modes).map((mode) => (
                    <div
                        key={mode.id}
                        onClick={() => {
                            setModeId(mode.id);
                        }}
                    >
                        {mode.actionRenderer?.(mode.id === modeId)}
                    </div>
                ))}
            </div>
        </div>
    );
};
