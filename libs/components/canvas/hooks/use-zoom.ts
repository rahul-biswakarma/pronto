import { type RefObject, useCallback, useEffect, useState } from "react";
import { useCanvas } from "../contexts/canvas.context";

// Update the type to accept a ref that might be null
export function useZoom(canvasRef: RefObject<HTMLDivElement | null>) {
  const { scale, setScale } = useCanvas();
  const [minScale] = useState(0.1);
  const [maxScale] = useState(5);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(scale + delta, minScale), maxScale);
        setScale(newScale);
      }
    },
    [scale, setScale, minScale, maxScale],
  );

  const zoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.1, maxScale);
    setScale(newScale);
  }, [scale, setScale, maxScale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.1, minScale);
    setScale(newScale);
  }, [scale, setScale, minScale]);

  const resetZoom = useCallback(() => {
    setScale(1);
  }, [setScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, handleWheel]);

  return { scale, zoomIn, zoomOut, resetZoom };
}
