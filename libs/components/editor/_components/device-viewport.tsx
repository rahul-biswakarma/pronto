"use client";
import { useEffect, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { DeviceType } from "../types";
import { Desktop } from "./device-mockups/desktop";
import { MOCKUP_INTERACTION_EVENT, Mobile } from "./device-mockups/mobile";
import { NormalView } from "./device-mockups/normal";
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

    // Track whether we're interacting with the iframe content
    const [isInteractingWithContent, setIsInteractingWithContent] =
        useState(false);

    // Listen for custom interaction events from device mockups
    useEffect(() => {
        const handleMockupInteraction = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsInteractingWithContent(customEvent.detail.interacting);
        };

        // Add event listener for custom mockup interaction events
        window.addEventListener(
            MOCKUP_INTERACTION_EVENT,
            handleMockupInteraction,
        );

        return () => {
            window.removeEventListener(
                MOCKUP_INTERACTION_EVENT,
                handleMockupInteraction,
            );
        };
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-white">
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                centerOnInit={false} // Prevent auto-centering
                limitToBounds={false} // Allow panning outside bounds
                wheel={{
                    wheelDisabled: isInteractingWithContent, // Disable wheel zoom when interacting with content
                    step: 0.1, // Smaller zoom steps for more control
                }}
                panning={{
                    disabled: isInteractingWithContent, // Disable panning when interacting with content
                    velocityDisabled: true, // Prevent continued panning after release
                }}
                // Additional options to improve the experience
                alignmentAnimation={{ disabled: true }} // Disable alignment animations
                velocityAnimation={{ disabled: true }} // Disable velocity animations
                doubleClick={{ disabled: true }} // Disable double-click to zoom
            >
                {({ zoomIn, zoomOut, resetTransform, instance }) => (
                    <>
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
                                {deviceType === "normal" && (
                                    <NormalView>{wrappedChildren}</NormalView>
                                )}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};
