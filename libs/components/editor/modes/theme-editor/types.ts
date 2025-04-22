export interface ColorVariable {
    name: string;
    value: string;
    displayName: string;
}

export interface Theme {
    name: string;
    colors: Record<string, string>;
}
