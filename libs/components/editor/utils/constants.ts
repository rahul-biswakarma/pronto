/**
 * Editor prefix constants
 */
export const SECTION_ID_PREFIX = "feno-sec";
export const COLOR_VAR_PREFIX = "feno-color";

/**
 * CSS class names for highlighting
 */
export const CSS_CLASSES = {
    SECTION_HOVER: "feno-hover",
    SECTION_SELECTED: "feno-selected",
    CMS_HOVER: "feno-cms-hover",
    CMS_SELECTED: "feno-cms-selected",
};

/**
 * Editor modes
 */
export const EDITOR_MODES = {
    DEFAULT: "default",
    SECTION_EDIT: "section-edit",
    THEME_EDITOR: "theme-editor",
    CMS_EDIT: "cms-edit",
    DEVELOPER: "developer",
    VERSION_HISTORY: "version-history",
} as const;

/**
 * Timing constants
 */
export const HOVER_DELAY_MS = 50;

/**
 * CSS styles for highlighting
 */
export const HIGHLIGHT_STYLES = `
  /* Base styles to prevent default browser styles from showing */
  [id^="${SECTION_ID_PREFIX}"], p, h1, h2, h3, h4, h5, h6, span, a, button, li, td, th, label, figcaption {
      transition: outline 0.1s ease, background-color 0.1s ease !important;
  }

  .${CSS_CLASSES.SECTION_HOVER} {
      outline: 2px dashed #3b82f6 !important;
      outline-offset: 1px !important;
      background-color: rgba(59, 130, 246, 0.05) !important;
      transition: none !important;
      position: relative !important;
      z-index: 10 !important;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1) !important;
  }

  .${CSS_CLASSES.SECTION_SELECTED} {
      outline: 3px solid #3b82f6 !important;
      outline-offset: 1px !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
      transition: none !important;
      position: relative !important;
      z-index: 20 !important;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
  }

  .${CSS_CLASSES.CMS_HOVER} {
      outline: 2px dashed #eab308 !important;
      outline-offset: 1px !important;
      background-color: rgba(234, 179, 8, 0.05) !important;
      transition: none !important;
      position: relative !important;
      z-index: 10 !important;
      box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.1) !important;
  }

  .${CSS_CLASSES.CMS_SELECTED} {
      outline: 3px solid #eab308 !important;
      outline-offset: 1px !important;
      background-color: rgba(234, 179, 8, 0.1) !important;
      transition: none !important;
      position: relative !important;
      z-index: 20 !important;
      box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.2) !important;
  }
`;
