import { IconArrowLeft, IconArrowUp } from "@tabler/icons-react";
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

    const SpacingInput = useCallback(
        ({
            value,
            onChange,
            icon,
            label,
            id,
        }: {
            value: string;
            onChange: (value: string) => void;
            icon: React.ReactNode;
            label: string;
            id: string;
        }) => {
            return (
                <div className="flex items-center gap-1.5">
                    <label htmlFor={id} className="text-xs text-gray-600">
                        {label}
                    </label>
                    <div className="relative flex items-center border border-gray-200 rounded-md overflow-hidden">
                        {icon}
                        <input
                            id={id}
                            type="number"
                            min="0"
                            value={parseValue(value)}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-14 h-7 px-2 text-[14px] outline-none focus:ring-1 focus:ring-gray-300"
                        />
                        <span className="text-gray-400 pr-2 pointer-events-none">
                            px
                        </span>
                    </div>
                </div>
            );
        },
        [parseValue],
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
        <div className="flex flex-col gap-3">
            {/* Margin X, Y in single row */}
            <div className="flex items-center justify-between gap-2 rounded-md py-1.5">
                <span
                    id="margin-label"
                    className="text-sm text-gray-600 font-medium"
                >
                    Margin
                </span>
                <div className="flex items-center gap-2">
                    <SpacingInput
                        id="margin-x"
                        label="X"
                        value={getMarginValue("Left")}
                        onChange={(value) => {
                            handleMarginChange("Left", value);
                            handleMarginChange("Right", value);
                        }}
                        icon={
                            <IconArrowLeft
                                size={12}
                                className="ml-2 text-gray-500"
                            />
                        }
                    />
                    <SpacingInput
                        id="margin-y"
                        label="Y"
                        value={getMarginValue("Top")}
                        onChange={(value) => {
                            handleMarginChange("Top", value);
                            handleMarginChange("Bottom", value);
                        }}
                        icon={
                            <IconArrowUp
                                size={12}
                                className="ml-2 text-gray-500"
                            />
                        }
                    />
                </div>
            </div>

            {/* Padding X, Y in single row */}
            <div className="flex items-center justify-between gap-2 rounded-md py-1.5">
                <span
                    id="padding-label"
                    className="text-sm text-gray-600 font-medium"
                >
                    Padding
                </span>
                <div className="flex items-center gap-2">
                    <SpacingInput
                        id="padding-x"
                        label="X"
                        value={getPaddingValue("Left")}
                        onChange={(value) => {
                            handlePaddingChange("Left", value);
                            handlePaddingChange("Right", value);
                        }}
                        icon={
                            <IconArrowLeft
                                size={12}
                                className="ml-2 text-gray-500"
                            />
                        }
                    />
                    <SpacingInput
                        id="padding-y"
                        label="Y"
                        value={getPaddingValue("Top")}
                        onChange={(value) => {
                            handlePaddingChange("Top", value);
                            handlePaddingChange("Bottom", value);
                        }}
                        icon={
                            <IconArrowUp
                                size={12}
                                className="ml-2 text-gray-500"
                            />
                        }
                    />
                </div>
            </div>
        </div>
    );
};
