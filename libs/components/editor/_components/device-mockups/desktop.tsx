"use client";
import { useCallback, useEffect } from "react";
import { MOCKUP_INTERACTION_EVENT } from "./mobile";

interface DesktopProps {
    children: React.ReactNode;
}

export const Desktop = ({ children }: DesktopProps) => {
    // Handle interaction with content
    const handleContentInteraction = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            // Stop propagation to parent
            e.stopPropagation();

            // Dispatch custom event that parent can listen for
            const event = new CustomEvent(MOCKUP_INTERACTION_EVENT, {
                detail: { interacting: true, device: "desktop" },
            });
            window.dispatchEvent(event);
        },
        [],
    );

    // Handle when interaction ends
    const handleInteractionEnd = useCallback(() => {
        const event = new CustomEvent(MOCKUP_INTERACTION_EVENT, {
            detail: { interacting: false, device: "desktop" },
        });
        window.dispatchEvent(event);
    }, []);

    // Set up global document handlers
    useEffect(() => {
        const handleGlobalUp = () => handleInteractionEnd();

        document.addEventListener("mouseup", handleGlobalUp);
        document.addEventListener("touchend", handleGlobalUp);

        return () => {
            document.removeEventListener("mouseup", handleGlobalUp);
            document.removeEventListener("touchend", handleGlobalUp);
        };
    }, [handleInteractionEnd]);

    return (
        <div
            className="grid grid-rows-[auto_1fr] relative min-w-[1100px] min-h-[700px] rounded-lg border border-black/10 overflow-hidden p-1.5 pt-0"
            style={{
                background:
                    "linear-gradient(90deg,rgba(228, 228, 241, 0.5) 0%, rgba(240, 240, 229, 0.5) 100%)",
            }}
        >
            <div className="flex justify-center items-center relative px-4 py-1.5 backdrop-blur-md">
                <div className="text-sm text-gray-600 z-10 rounded-[8px] bg-black/10 px-2 py-1 min-w-[250px] backdrop-blur-sm flex justify-center items-center">
                    feno.app
                </div>
            </div>

            <div
                className="w-full h-full rounded-sm border border-black/10 overflow-hidden"
                onMouseDown={handleContentInteraction}
                onTouchStart={handleContentInteraction}
                onWheel={handleContentInteraction}
            >
                <div className="w-full h-full">{children}</div>
            </div>
        </div>
    );
};
