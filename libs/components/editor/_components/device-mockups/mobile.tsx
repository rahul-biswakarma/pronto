"use client";
import { useCallback, useEffect } from "react";

interface MobileProps {
    children: React.ReactNode;
}

// Create a custom event for interacting with mockup content
export const MOCKUP_INTERACTION_EVENT = "mockup-interaction";

export const Mobile = ({ children }: MobileProps) => {
    // Handle interaction with content
    const handleContentInteraction = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            // Stop propagation to parent
            e.stopPropagation();

            // Dispatch custom event that parent can listen for
            const event = new CustomEvent(MOCKUP_INTERACTION_EVENT, {
                detail: { interacting: true, device: "mobile" },
            });
            window.dispatchEvent(event);
        },
        [],
    );

    // Handle when interaction ends
    const handleInteractionEnd = useCallback(() => {
        const event = new CustomEvent(MOCKUP_INTERACTION_EVENT, {
            detail: { interacting: false, device: "mobile" },
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
            className="relative w-[375px] h-[812px] rounded-[40px] border border-black/10 overflow-hidden p-4 shadow-md"
            style={{
                background:
                    "linear-gradient(90deg,rgba(228, 228, 241, 0.5) 0%, rgba(240, 240, 229, 0.5) 100%)",
            }}
        >
            {/* Content area */}
            <div
                className="w-full h-full rounded-[30px] border border-black/10 overflow-hidden"
                onMouseDown={handleContentInteraction}
                onTouchStart={handleContentInteraction}
                onWheel={handleContentInteraction}
            >
                <div className="w-full h-full overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};
