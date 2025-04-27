import { cn } from "@/libs/utils/misc";
import { useEffect } from "react";
import { useEditor } from "../context/editor.context";
import { useRouteContext } from "../context/route.context";
import { BlockEditorMode } from "../modes/block-editor/block-editor-mode";
import { ContentEditorMode } from "../modes/content-editor";
import { DeploymentMode } from "../modes/deployment/deployment";
import { PageEditorMode } from "../modes/page-editor/page-editor";
import { TemplateSelectorMode } from "../modes/template-selector/template-selector";
import { ThemeEditorMode } from "../modes/theme-editor/theme-editor";
import { ProfileSettingsMode } from "../modes/user-setting/user-setting";
export const Moder = () => {
    const {
        modes,

        modeId,
        setModeId,
        iframeDocument,

        registerMode,
        invalidateRegisteredModes,
    } = useEditor();

    const { activeRouteHtmlPath } = useRouteContext();

    const isPageExists = !!activeRouteHtmlPath;
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        invalidateRegisteredModes();
        if (isPageExists) {
            registerMode(PageEditorMode());
            registerMode(ContentEditorMode());
            registerMode(BlockEditorMode());
            registerMode(ThemeEditorMode());
            registerMode(DeploymentMode());
            registerMode(ProfileSettingsMode());
        } else {
            registerMode(TemplateSelectorMode());
            registerMode(DeploymentMode());
            registerMode(ProfileSettingsMode());
            setModeId("template-selector");
        }

        return () => {
            setModeId("");
        };
    }, [isPageExists, iframeDocument]);

    const handleModeClick = (id: string) => {
        // If clicking on the already active mode, deselect it
        if (id === modeId) {
            setModeId("");
        } else {
            setModeId(id);
        }
    };

    return (
        <div className="flex justify-center items-center fixed bottom-6 left-0 right-0 w-full">
            <div
                className={cn(
                    "bottom-8 feno-font-wrapper bg-[var(--feno-surface-2)] shadow-[var(--feno-floating-shadow)] border border-[var(--feno-border-1)] p-1.5 pb-0 rounded-2xl max-w-[min(900px,90vw)] max-h-fit",
                    {
                        "pb-1.5 bg-[var(--feno-surface-1)]": !modeId,
                    },
                )}
            >
                {modeId && (
                    <div
                        key={`content-${modeId}`}
                        className="rounded-xl overflow-hidden"
                    >
                        {modes[modeId]?.editorRenderer()}
                    </div>
                )}

                <div className="w-full flex">
                    <div className="flex items-center w-full gap-1.5">
                        {Object.values(modes).map((mode) => (
                            <div
                                key={mode.id}
                                className={cn(
                                    modeId && "py-1.5",
                                    mode.id === "deployment" && "ml-auto",
                                    mode.id === "deployment" &&
                                        modeId === "" &&
                                        "ml-2 border-l border-[var(--feno-border-1)] pl-5",
                                )}
                                onClick={() => handleModeClick(mode.id)}
                            >
                                {mode.actionRenderer?.(mode.id === modeId)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
