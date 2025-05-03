"use client";

import { cn } from "@/libs/utils/misc";
import { useCallback, useEffect, useRef, useState } from "react";

interface CanvasIframeProps {
    html: string;
}

export const CanvasIframe = ({ html }: CanvasIframeProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState<number>(0);
    const [isHovered, setIsHovered] = useState(false);

    const updateHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument) return;

        const body = iframe.contentDocument.body;
        const html = iframe.contentDocument.documentElement;

        // Get the maximum height between body and html
        const newHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
        );

        // Add a small buffer to prevent scrollbars
        setHeight(newHeight + 20);
    }, []);

    // Handle canvas-related events
    const handleCanvasEvent = useCallback((e: MouseEvent | WheelEvent) => {
        // Create a new event with the same properties
        let newEvent: MouseEvent | WheelEvent;

        if (e instanceof WheelEvent) {
            // Get the iframe's position relative to the viewport
            const iframe = iframeRef.current;
            if (!iframe) return;

            const rect = iframe.getBoundingClientRect();

            // Calculate the mouse position relative to the iframe
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;

            // Create a new wheel event with the correct coordinates
            newEvent = new WheelEvent(e.type, {
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ,
                deltaMode: e.deltaMode,
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
            });
        } else {
            newEvent = new MouseEvent(e.type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                button: e.button,
                buttons: e.buttons,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
            });
        }

        // Dispatch the event to the parent
        e.target?.dispatchEvent(newEvent);
    }, []);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument) return;

        // Initial height update after content loads
        iframe.onload = () => {
            updateHeight();
        };

        // Set up ResizeObserver to watch for content size changes
        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        // Set up MutationObserver to watch for DOM changes
        const mutationObserver = new MutationObserver(() => {
            updateHeight();
        });

        // Observe both body and html for changes
        const body = iframe.contentDocument.body;
        const html = iframe.contentDocument.documentElement;

        resizeObserver.observe(body);
        resizeObserver.observe(html);
        mutationObserver.observe(body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });

        // Add event listeners for canvas-related events
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                // Get the iframe's position relative to the viewport
                const rect = iframe.getBoundingClientRect();

                // Calculate the mouse position relative to the iframe
                const relativeX = e.clientX - rect.left;
                const relativeY = e.clientY - rect.top;

                // Create a new wheel event with the correct coordinates
                const newEvent = new WheelEvent(e.type, {
                    deltaX: e.deltaX,
                    deltaY: e.deltaY,
                    deltaZ: e.deltaZ,
                    deltaMode: e.deltaMode,
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey,
                });

                // Dispatch the event to the parent
                e.target?.dispatchEvent(newEvent);
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0 && e.altKey) {
                e.preventDefault();
                handleCanvasEvent(e);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (e.altKey) {
                e.preventDefault();
                handleCanvasEvent(e);
            }
        };

        iframe.addEventListener("wheel", handleWheel, { passive: false });
        iframe.addEventListener("mousedown", handleMouseDown);
        iframe.addEventListener("mousemove", handleMouseMove);

        // Cleanup observers and event listeners
        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            iframe.removeEventListener("wheel", handleWheel);
            iframe.removeEventListener("mousedown", handleMouseDown);
            iframe.removeEventListener("mousemove", handleMouseMove);
        };
    }, [updateHeight, handleCanvasEvent]);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <iframe
                ref={iframeRef}
                srcDoc={html}
                className={cn("border-0", isHovered && "pointer-events-none")}
                style={{
                    width: "1200px", // Standard desktop width
                    height: height || "100%", // Dynamic height based on content
                    backgroundColor: "white",
                    minHeight: "100px", // Minimum height to prevent collapse
                }}
                title="Canvas Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
            {/* Transparent overlay to capture events when iframe is hovered */}
            {isHovered && (
                <div
                    className="absolute inset-0"
                    onWheel={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            // Get the overlay's position relative to the viewport
                            const rect =
                                e.currentTarget.getBoundingClientRect();

                            // Calculate the mouse position relative to the overlay
                            const relativeX = e.clientX - rect.left;
                            const relativeY = e.clientY - rect.top;

                            // Create a new wheel event with the correct coordinates
                            const newEvent = new WheelEvent(e.type, {
                                deltaX: e.deltaX,
                                deltaY: e.deltaY,
                                deltaZ: e.deltaZ,
                                deltaMode: e.deltaMode,
                                bubbles: true,
                                cancelable: true,
                                view: window,
                                clientX: e.clientX,
                                clientY: e.clientY,
                                screenX: e.screenX,
                                screenY: e.screenY,
                                ctrlKey: e.ctrlKey,
                                shiftKey: e.shiftKey,
                                altKey: e.altKey,
                                metaKey: e.metaKey,
                            });

                            // Dispatch the event to the parent
                            e.target?.dispatchEvent(newEvent);
                        }
                    }}
                    onMouseDown={(e) => {
                        if (e.button === 0 && e.altKey) {
                            e.preventDefault();
                            handleCanvasEvent(e.nativeEvent);
                        }
                    }}
                    onMouseMove={(e) => {
                        if (e.altKey) {
                            e.preventDefault();
                            handleCanvasEvent(e.nativeEvent);
                        }
                    }}
                />
            )}
        </div>
    );
};
