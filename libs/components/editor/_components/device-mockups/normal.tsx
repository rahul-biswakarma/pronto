"use client";
import { useCallback, useEffect } from "react";
import { MOCKUP_INTERACTION_EVENT } from "./mobile";

interface NormalViewProps {
    children: React.ReactNode;
}

export const NormalView = ({ children }: NormalViewProps) => {
    // Handle interaction with content
    const handleContentInteraction = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            // Stop propagation to parent
            e.stopPropagation();

            // Dispatch custom event that parent can listen for
            const event = new CustomEvent(MOCKUP_INTERACTION_EVENT, {
                detail: { interacting: true, device: "normal" },
            });
            window.dispatchEvent(event);
        },
        [],
    );

    // Handle when interaction ends
    const handleInteractionEnd = useCallback(() => {
        const event = new CustomEvent(MOCKUP_INTERACTION_EVENT, {
            detail: { interacting: false, device: "normal" },
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
            className="w-[100vw] h-[100vh] overflow-hidden"
            onMouseDown={handleContentInteraction}
            onTouchStart={handleContentInteraction}
            onWheel={handleContentInteraction}
        >
            <div className="w-full h-full">{children}</div>
        </div>
    );
};
