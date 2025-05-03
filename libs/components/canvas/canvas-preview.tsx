"use client";

import type React from "react";

import { motion } from "framer-motion";
import {} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/libs/utils/misc";
import { CanvasIframe } from "./canvas-iframe";

export function InfiniteCanvas({
    frames,
}: {
    frames: Array<{ html: string }>;
}) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Handle mouse down for panning (only when space is pressed)
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return; // Only left mouse button

            if (isSpacePressed) {
                setIsDragging(true);
                setDragStart({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                });
            }
        },
        [position, isSpacePressed],
    );

    // Handle mouse move for panning
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        },
        [isDragging, dragStart],
    );

    // Handle mouse up to stop panning
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle wheel for zooming (only when ctrl is pressed) or vertical scrolling
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();

            if (isCtrlPressed) {
                // Zooming functionality when Ctrl is pressed
                // Get mouse position relative to canvas
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;

                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate the point on the canvas where the mouse is pointing
                const pointX = (mouseX - position.x) / scale;
                const pointY = (mouseY - position.y) / scale;

                // Determine new scale
                const newScale = Math.max(
                    0.1,
                    Math.min(5, scale - e.deltaY * 0.001),
                );

                // Calculate new position to zoom toward mous   e position
                const newPosition = {
                    x: mouseX - pointX * newScale,
                    y: mouseY - pointY * newScale,
                };

                setScale(newScale);
                setPosition(newPosition);
            } else {
                // Vertical scrolling when neither Ctrl nor Space is pressed
                setPosition((prev) => ({
                    x: prev.x,
                    y: prev.y - e.deltaY,
                }));
            }
        },
        [position, scale, isCtrlPressed],
    );

    // Handle key down events
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === "Space" && !e.repeat) {
            setIsSpacePressed(true);
        }
        if (e.ctrlKey) {
            setIsCtrlPressed(true);
        }
    }, []);

    // Handle key up events
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === "Space") {
            setIsSpacePressed(false);
            setIsDragging(false);
        }
        if (!e.ctrlKey) {
            setIsCtrlPressed(false);
        }
    }, []);

    // Set up event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            canvas.removeEventListener("wheel", handleWheel);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [
        handleWheel,
        handleMouseMove,
        handleMouseUp,
        handleKeyDown,
        handleKeyUp,
    ]);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-100">
            {/* Canvas */}
            <div
                ref={canvasRef}
                className={cn(
                    "absolute h-full w-full overflow-hidden",
                    isSpacePressed
                        ? isDragging
                            ? "cursor-grabbing"
                            : "cursor-grab"
                        : isCtrlPressed
                          ? "cursor-zoom-in"
                          : "cursor-default",
                )}
                onMouseDown={handleMouseDown}
            >
                {/* Grid background */}
                <div
                    className="absolute left-0 top-0 h-[10000px] w-[10000px] origin-top-left bg-[url('/placeholder.svg?height=50&width=50')] bg-[length:50px_50px] opacity-10"
                    style={{
                        transform: `translate(${position.x - 5000}px, ${position.y - 5000}px) scale(${scale})`,
                    }}
                />

                {/* Iframe content */}
                <motion.div
                    className="flex gap-10 absolute left-1/2 top-1/4 origin-top-left -translate-x-1/2"
                    style={{
                        x: position.x,
                        y: position.y,
                        scale,
                    }}
                >
                    {frames.map((frame, index) => (
                        <CanvasIframe key={frame.html} html={frame.html} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
