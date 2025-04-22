import { useCallback } from "react";

interface SpacingControlsProps {
    styles: React.CSSProperties;
    onStyleChange: (property: keyof React.CSSProperties, value: string) => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
    styles,
    onStyleChange,
}) => {
    const parseValue = useCallback((value: string): number => {
        return Number.parseInt(value, 10) || 0;
    }, []);

    const handleMarginChange = useCallback(
        (direction: string, value: string) => {
            const numValue = parseValue(value);
            onStyleChange(
                `margin${direction}` as keyof React.CSSProperties,
                `${numValue}px`,
            );
        },
        [onStyleChange, parseValue],
    );

    const handlePaddingChange = useCallback(
        (direction: string, value: string) => {
            const numValue = parseValue(value);
            onStyleChange(
                `padding${direction}` as keyof React.CSSProperties,
                `${numValue}px`,
            );
        },
        [onStyleChange, parseValue],
    );

    const resetValue = useCallback((handler: (value: string) => void) => {
        handler("0");
    }, []);

    const SpacingInput = useCallback(
        ({
            value,
            onChange,
            id,
        }: {
            value: string;
            onChange: (value: string) => void;
            id: string;
        }) => {
            return (
                <div className="relative flex items-center">
                    <div className="relative w-36 h-8 border border-[var(--feno-border-1)] rounded-lg flex items-center overflow-hidden">
                        <input
                            id={id}
                            type="number"
                            min="0"
                            value={parseValue(value)}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full h-full px-3 text-base outline-none"
                        />
                        <span className="text-[var(--feno-text-2)] mr-2 pointer-events-none absolute right-0">
                            px
                        </span>
                        {/* {parseValue(value) > 0 && (
                            <button
                                type="button"
                                className="absolute right-2 p-1 text-[var(--feno-text-2)]"
                                onClick={() => resetValue(onChange)}
                                aria-label="Clear value"
                            >
                                <IconX size={16} />
                            </button>
                        )} */}
                    </div>
                </div>
            );
        },
        [parseValue, resetValue],
    );

    const getMarginValue = (direction: string): string => {
        const prop = `margin${direction}` as keyof React.CSSProperties;
        const value = String(styles[prop] || "0");
        return value.replace("px", "");
    };

    const getPaddingValue = (direction: string): string => {
        const prop = `padding${direction}` as keyof React.CSSProperties;
        const value = String(styles[prop] || "0");
        return value.replace("px", "");
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="text-lg font-medium text-[var(--feno-text-1)]">
                Spacing
            </div>

            <div className="flex flex-col gap-2">
                {/* Margin Row */}
                <div className="flex justify-between items-center">
                    <div className="text-base text-[var(--feno-text-1)]">
                        Margin
                    </div>
                    <div className="flex gap-2">
                        <SpacingInput
                            id="margin-x"
                            value={getMarginValue("Left")}
                            onChange={(value) => {
                                handleMarginChange("Left", value);
                                handleMarginChange("Right", value);
                            }}
                        />
                        <SpacingInput
                            id="margin-y"
                            value={getMarginValue("Top")}
                            onChange={(value) => {
                                handleMarginChange("Top", value);
                                handleMarginChange("Bottom", value);
                            }}
                        />
                    </div>
                </div>

                {/* Padding Row */}
                <div className="flex justify-between items-center">
                    <div className="text-base text-[var(--feno-text-1)]">
                        Padding
                    </div>
                    <div className="flex gap-2">
                        <SpacingInput
                            id="padding-x"
                            value={getPaddingValue("Left")}
                            onChange={(value) => {
                                handlePaddingChange("Left", value);
                                handlePaddingChange("Right", value);
                            }}
                        />
                        <SpacingInput
                            id="padding-y"
                            value={getPaddingValue("Top")}
                            onChange={(value) => {
                                handlePaddingChange("Top", value);
                                handlePaddingChange("Bottom", value);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
