import { type RefObject, useCallback, useEffect, useState } from "react";
import { useCanvas } from "../contexts/canvas.context";

// Update the type to accept a ref that might be null
export function usePan(canvasRef: RefObject<HTMLDivElement | null>) {
  const { position, setPosition } = useCanvas();
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Only start panning with middle mouse button or space + left mouse button
      if (e.button === 1 || (e.button === 0 && e.getModifierState("Space"))) {
        e.preventDefault();
        setIsPanning(true);
        setStartPanPosition({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const newX = e.clientX - startPanPosition.x;
      const newY = e.clientY - startPanPosition.y;
      setPosition({ x: newX, y: newY });
    },
    [isPanning, startPanPosition, setPosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp]);

  return { position, isPanning };
}
