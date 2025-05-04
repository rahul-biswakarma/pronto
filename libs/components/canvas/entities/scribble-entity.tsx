"use client";

import { useEffect, useRef, useState } from "react";

type ScribbleEntityProps = {
    data: string | null;
};

export default function ScribbleEntity({ data }: ScribbleEntityProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState<
        Array<{ x: number; y: number; isDraw: boolean }>
    >([]);

    // Load existing data if available
    useEffect(() => {
        if (data && canvasRef.current) {
            try {
                const parsedData = JSON.parse(data);
                setPaths(parsedData);
                drawPaths(parsedData);
            } catch (err) {
                console.error("Error parsing scribble data:", err);
            }
        }
    }, [data]);

    // Draw paths whenever they change
    useEffect(() => {
        drawPaths(paths);
    }, [paths]);

    const drawPaths = (
        pathsToDraw: Array<{ x: number; y: number; isDraw: boolean }>,
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set drawing style
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Draw paths
        ctx.beginPath();
        pathsToDraw.forEach((point, index) => {
            if (point.isDraw && index > 0) {
                ctx.lineTo(point.x, point.y);
            } else {
                ctx.moveTo(point.x, point.y);
            }
        });
        ctx.stroke();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPaths([...paths, { x, y, isDraw: false }]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPaths([...paths, { x, y, isDraw: true }]);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full bg-white"
            width={300}
            height={200}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
}
