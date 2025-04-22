/**
 * Represents a CSS color variable
 */
export interface ColorVariable {
    name: string;
    value: string;
    label?: string;
}

/**
 * Represents a theme with a collection of colors
 */
export interface Theme {
    name: string;
    colors: Record<string, string>;
}
