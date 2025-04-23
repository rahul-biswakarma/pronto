"use client";

import { Label } from "@/libs/ui/label";
import { Slider } from "@/libs/ui/slider";
import { useEffect, useState } from "react";
import { updateColorVariable } from "../utils";
import { chromaVariableName, hueVariableName } from "./utils";

interface HueSaturationControlsProps {
    initialHue?: number;
    initialChroma?: number;
    onHueChange: (value: number) => void;
    onSaturationChange: (value: number) => void;
}

export const HueSaturationControls: React.FC<HueSaturationControlsProps> = ({
    initialHue = 35,
    initialChroma = 0.097,
    onHueChange,
    onSaturationChange,
}) => {
    const [hue, setHue] = useState(initialHue);
    const [chroma, setChroma] = useState(initialChroma);

    useEffect(() => {
        if (typeof document === "undefined") return;

        // Get initial values from CSS if available
        const rootStyles = getComputedStyle(document.documentElement);
        const cssHue = rootStyles.getPropertyValue(hueVariableName).trim();
        const cssChroma = rootStyles
            .getPropertyValue(chromaVariableName)
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

        if (!cssChroma) {
            updateColorVariable(
                document,
                chromaVariableName,
                initialChroma.toString(),
            );
            setChroma(initialChroma);
        } else {
            setChroma(Number(cssChroma) || initialChroma);
        }
    }, [initialHue, initialChroma]);

    const handleHueChange = (value: number[]) => {
        if (value[0] !== undefined) {
            const newHue = value[0];
            setHue(newHue);
            onHueChange(newHue);
        }
    };

    const handleChromaChange = (value: number[]) => {
        if (value[0] !== undefined) {
            const newChroma = value[0];
            setChroma(newChroma);
            onSaturationChange(newChroma);
        }
    };

    // Generate colors for the hue slider gradient
    const hueGradient = `linear-gradient(to right,
    hsl(0, 100%, 50%), hsl(60, 100%, 50%),
    hsl(120, 100%, 50%), hsl(180, 100%, 50%),
    hsl(240, 100%, 50%), hsl(300, 100%, 50%),
    hsl(360, 100%, 50%))`;

    // Generate colors for the chroma slider gradient
    const chromaGradient = `linear-gradient(to right,
    hsl(${hue}, 0%, 50%), hsl(${hue}, 50%, 50%),
    hsl(${hue}, 100%, 50%))`;

    // Current color for hue thumb
    const hueThumbColor = `hsl(${hue}, 100%, 50%)`;

    // Current color for chroma thumb
    const chromaThumbColor = `hsl(${hue}, ${chroma * 100}%, 50%)`;

    return (
        <div className="space-y-8 w-full py-3">
            <div className="flex items-center justify-between gap-4">
                <Label
                    htmlFor="hue-slider"
                    className="text-base font-medium w-28"
                >
                    Base tone:
                </Label>
                <div className="flex-grow relative">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: hueGradient,
                            height: "100%",
                            width: "100%",
                        }}
                    />
                    <Slider
                        id="hue-slider"
                        min={0}
                        max={360}
                        step={1}
                        value={[hue]}
                        thumbColor={hueThumbColor}
                        onValueChange={handleHueChange}
                        className="z-10"
                    />
                </div>
                <div className="min-w-[80px] px-4 py-2 bg-white border border-[var(--feno-border-1)] rounded-md text-center">
                    {Math.round(hue)}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <Label
                    htmlFor="chroma-slider"
                    className="text-base font-medium w-28"
                >
                    Amount of color in gray:
                </Label>
                <div className="flex-grow relative">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: chromaGradient,
                            height: "100%",
                            width: "100%",
                        }}
                    />
                    <Slider
                        id="chroma-slider"
                        min={0}
                        max={1}
                        step={0.001}
                        value={[chroma]}
                        thumbColor={chromaThumbColor}
                        onValueChange={handleChromaChange}
                        className="z-10"
                    />
                </div>
                <div className="min-w-[80px] px-4 py-2 bg-white border border-[var(--feno-border-1)] rounded-md text-center">
                    {chroma.toFixed(3)}
                </div>
            </div>
        </div>
    );
};
