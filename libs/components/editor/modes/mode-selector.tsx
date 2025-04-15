"use client";

import { VersionHistoryPanel } from "../_components/version-history";
import { EDITOR_MODES } from "../constants";
import { useEditorContext } from "../editor.context";
import { CmsEditMode } from "./cms-edit/cms-mode";
import { DefaultMode } from "./default/default-mode";
import { DeveloperMode } from "./developer/developer-mode";
import { SectionEditMode } from "./section-edit/section-edit-mode";
import { ThemeEditorMode } from "./theme-editor/theme-edit-mode";

export const ModeSelector: React.FC = () => {
    const { activeMode } = useEditorContext();

    // Render the appropriate mode component based on active mode
    switch (activeMode) {
        case EDITOR_MODES.SECTION_EDIT:
            return <SectionEditMode />;
        case EDITOR_MODES.CMS_EDIT:
            return <CmsEditMode />;
        case EDITOR_MODES.THEME_EDITOR:
            return <ThemeEditorMode />;
        case EDITOR_MODES.DEVELOPER:
            return <DeveloperMode />;
        case EDITOR_MODES.VERSION_HISTORY:
            return <VersionHistoryPanel />;
        default:
            return <DefaultMode />;
    }
};
