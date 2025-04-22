export const AVAILABLE_FONTS = [
    // System Fonts
    "System UI",
    "Arial",
    "Helvetica",
    "Verdana",
    "Georgia",
    "Times New Roman",
    "Courier New",
    // Google Fonts (add more as needed)
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Source Sans Pro",
    "Oswald",
    "Raleway",
    "Nunito",
    "Playfair Display",
    "Merriweather",
    "Inter",
];

/**
 * Load a Google Font into the iframe document
 */
export function loadGoogleFont(fontFamily: string, document: Document | null) {
    if (!document || !fontFamily || AVAILABLE_FONTS.indexOf(fontFamily) < 7) {
        // Only load Google Fonts (index 7 onwards)
        return;
    }

    const fontId = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(fontId)) {
        return; // Already loaded
    }

    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css?family=${fontFamily.replace(/\s+/g, "+")}:wght@400;700&display=swap`; // Load regular and bold weights
    document.head.appendChild(link);
}

export function parsePixelValue(value: string): number {
    if (!value || typeof value !== "string") return 16; // Default font size
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 16 : parsed;
}

export function rgbToHex(rgb: string): string {
    if (!rgb || typeof rgb !== "string") return "#000000";
    if (rgb.startsWith("#")) return rgb; // Already hex

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return "#000000"; // Invalid RGB

    const r = Number.parseInt(result[0], 10);
    const g = Number.parseInt(result[1], 10);
    const b = Number.parseInt(result[2], 10);

    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${hex}`;
}
