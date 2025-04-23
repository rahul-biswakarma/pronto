"use client";

import { Label } from "@/libs/ui/label";
import { Slider } from "@/libs/ui/slider";
import { useEffect, useState } from "react";
import { updateColorVariable } from "../utils";
import { hueVariableName, saturationVariableName } from "./utils";

interface HueSaturationControlsProps {
    initialHue?: number;
    initialSaturation?: number;
    onHueChange: (value: number) => void;
    onSaturationChange: (value: number) => void;
}

export const HueSaturationControls: React.FC<HueSaturationControlsProps> = ({
    initialHue = 8,
    initialSaturation = 0.097,
    onHueChange,
    onSaturationChange,
}) => {
    const [hue, setHue] = useState(initialHue);
    const [saturation, setSaturation] = useState(initialSaturation);

    useEffect(() => {
        if (typeof document === "undefined") return;

        // Get initial values from CSS if available
        const rootStyles = getComputedStyle(document.documentElement);
        const cssHue = rootStyles.getPropertyValue(hueVariableName).trim();
        const cssSaturation = rootStyles
            .getPropertyValue(saturationVariableName)
            .trim();

        // If variables don't exist, set them with default values
        if (!cssHue) {
            updateColorVariable(
                document,
                hueVariableName,
                initialHue.toString(),
            );
            setHue(initialHue);
        } else {
            setHue(Number(cssHue) || initialHue);
        }

        if (!cssSaturation) {
            updateColorVariable(
                document,
                saturationVariableName,
                initialSaturation.toString(),
            );
            setSaturation(initialSaturation);
        } else {
            setSaturation(Number(cssSaturation) || initialSaturation);
        }
    }, [initialHue, initialSaturation]);

    const handleHueChange = (value: number[]) => {
        const newHue = value[0];
        setHue(newHue);
        onHueChange(newHue);
    };

    const handleSaturationChange = (value: number[]) => {
        const newSaturation = value[0];
        setSaturation(newSaturation);
        onSaturationChange(newSaturation);
    };

    // Generate colors for the hue slider gradient
    const hueGradient = `linear-gradient(to right,
    hsl(0, 100%, 50%), hsl(60, 100%, 50%),
    hsl(120, 100%, 50%), hsl(180, 100%, 50%),
    hsl(240, 100%, 50%), hsl(300, 100%, 50%),
    hsl(360, 100%, 50%))`;

    // Generate colors for the saturation slider gradient
    const saturationGradient = `linear-gradient(to right,
    hsl(${hue}, 0%, 50%), hsl(${hue}, 50%, 50%),
    hsl(${hue}, 100%, 50%))`;

    return (
        <div className="space-y-6 w-full border border-[var(--feno-border-1)] rounded-md p-3">
            <h4 className="text-sm font-medium mb-4">Global Color Controls</h4>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="hue-slider">Base tone:</Label>
                    <span className="text-sm font-medium">{hue}</span>
                </div>
                <div className="relative w-full" style={{ overflow: "hidden" }}>
                    <div
                        className="absolute inset-0 rounded-md opacity-80"
                        style={{
                            background: hueGradient,
                            height: "100%",
                            width: "100%",
                            zIndex: 0,
                        }}
                    />
                    <Slider
                        id="hue-slider"
                        min={0}
                        max={360}
                        step={1}
                        defaultValue={[hue]}
                        onValueChange={handleHueChange}
                        className="z-10 relative"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="saturation-slider">
                        Amount of color in gray:
                    </Label>
                    <span className="text-sm font-medium">
                        {saturation.toFixed(3)}
                    </span>
                </div>
                <div className="relative w-full" style={{ overflow: "hidden" }}>
                    <div
                        className="absolute inset-0 rounded-md opacity-80"
                        style={{
                            background: saturationGradient,
                            height: "100%",
                            width: "100%",
                            zIndex: 0,
                        }}
                    />
                    <Slider
                        id="saturation-slider"
                        min={0}
                        max={1}
                        step={0.001}
                        defaultValue={[saturation]}
                        onValueChange={handleSaturationChange}
                        className="z-10 relative"
                    />
                </div>
            </div>
        </div>
    );
};
