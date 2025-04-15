"use client";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { DeviceType } from "../types";
import { Desktop } from "./device-mockups/desktop";
import { Mobile } from "./device-mockups/mobile";
import { Tablet } from "./device-mockups/tablet";

interface DeviceViewportProps {
    children: React.ReactNode;
    deviceType: DeviceType;
}

export const DeviceViewport = ({
    children,
    deviceType,
}: DeviceViewportProps) => {
    // Use a consistent child key to prevent remounting the iframe when device changes
    const wrappedChildren = (
        <div className="w-full h-full" key="iframe-wrapper">
            {children}
        </div>
    );

    return (
        <div className="w-full h-full flex items-center justify-center bg-white">
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                centerOnInit
                wheel={{ wheelDisabled: false }}
            >
                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                >
                    <div className="flex items-center justify-center h-full w-full">
                        {deviceType === "desktop" && (
                            <Desktop>{wrappedChildren}</Desktop>
                        )}
                        {deviceType === "tablet" && (
                            <Tablet>{wrappedChildren}</Tablet>
                        )}
                        {deviceType === "mobile" && (
                            <Mobile>{wrappedChildren}</Mobile>
                        )}
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};
