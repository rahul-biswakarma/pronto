import { useCallback } from "react";
import { useCanvas } from "../contexts/canvas.context";

export function useDrag() {
  const { entities, updateEntity, selectedEntityId, selectEntity } =
    useCanvas();

  const startDrag = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      selectEntity(id);

      const entity = entities.find((entity) => entity.id === id);
      if (!entity) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startEntityX = entity.x;
      const startEntityY = entity.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        updateEntity(id, {
          x: startEntityX + dx,
          y: startEntityY + dy,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [entities, selectEntity, updateEntity],
  );

  return { startDrag, selectedEntityId };
}
