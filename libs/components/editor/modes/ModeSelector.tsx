"use client";

import { EDITOR_MODES } from "../constants";
import { useEditorContext } from "../editor.context";
import { CmsEditMode } from "./cms-edit/CmsEditMode";
import { DefaultMode } from "./default/DefaultMode";
import { SectionEditMode } from "./section-edit/SectionEditMode";
import { ThemeEditorMode } from "./theme-editor/ThemeEditorMode";

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
        default:
            return <DefaultMode />;
    }
};
