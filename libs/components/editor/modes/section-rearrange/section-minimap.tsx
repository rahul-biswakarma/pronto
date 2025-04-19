import { cn } from "@/libs/utils/misc"; // Assuming you have this utility
import { IconGripVertical } from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Section {
    id: string;
    name: string;
    // aspectRatio?: number; // Keep for future use
}

interface SectionMinimapProps {
    sections: Section[];
    onReorder: (newOrderedIds: string[]) => void;
}

const SectionMinimap: React.FC<SectionMinimapProps> = ({
    sections: initialSections,
    onReorder,
}) => {
    // Use local state derived from props to manage the order during drag operations
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // Update local state if the initial sections prop changes
    useEffect(() => {
        setSections(initialSections);
    }, [initialSections]);

    const draggedItem = useRef<Section | null>(null);
    const dropTargetItem = useRef<Section | null>(null);

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        section: Section,
    ) => {
        draggedItem.current = section;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", section.id);
        setDraggingId(section.id);
    };

    const handleDragEnter = (
        e: React.DragEvent<HTMLDivElement>,
        section: Section,
    ) => {
        e.preventDefault(); // Necessary for drop
        if (draggedItem.current && draggedItem.current.id !== section.id) {
            dropTargetItem.current = section;
            setDragOverId(section.id); // Indicate visually where drop will occur
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary for drop
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragLeave = (
        e: React.DragEvent<HTMLDivElement>,
        section: Section,
    ) => {
        e.preventDefault();
        // Only remove dragOver state if leaving the specific item we were over
        if (
            dropTargetItem.current &&
            dropTargetItem.current.id === section.id
        ) {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                // Check if not entering a child
                setDragOverId(null);
                dropTargetItem.current = null;
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (
            !draggedItem.current ||
            !dropTargetItem.current ||
            draggedItem.current.id === dropTargetItem.current.id
        ) {
            // Reset state if drop is invalid or on itself
            cleanupDragState();
            return;
        }

        const currentSections = [...sections]; // Use local state for calculation
        const draggedIndex = currentSections.findIndex(
            (sec) => sec.id === draggedItem.current!.id,
        );
        const targetIndex = currentSections.findIndex(
            (sec) => sec.id === dropTargetItem.current!.id,
        );

        if (draggedIndex === -1 || targetIndex === -1) {
            console.error("Dragged or target item not found in local state.");
            cleanupDragState();
            return;
        }

        // Remove the dragged item and insert it at the target position
        const [movedItem] = currentSections.splice(draggedIndex, 1);
        currentSections.splice(targetIndex, 0, movedItem);

        // Update local state immediately for visual feedback
        setSections(currentSections);

        // Call the callback prop with the new order of IDs
        const newOrderedIds = currentSections.map((sec) => sec.id);
        onReorder(newOrderedIds);

        cleanupDragState();
    };

    const handleDragEnd = () => {
        cleanupDragState();
    };

    const cleanupDragState = () => {
        setDraggingId(null);
        setDragOverId(null);
        draggedItem.current = null;
        dropTargetItem.current = null;
    };

    return (
        <div className="space-y-1 min-h-[10rem] overflow-y-auto p-4 pt-1">
            {sections.length === 0 ? (
                <p className="text-xs text-gray-400 text-center italic py-4">
                    No sections found.
                </p>
            ) : (
                sections.map((section) => (
                    <div
                        key={section.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, section)}
                        onDragEnter={(e) => handleDragEnter(e, section)}
                        onDragOver={handleDragOver} // Need this on each item
                        onDragLeave={(e) => handleDragLeave(e, section)}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        title={section.id}
                        className={cn(
                            "group bg-white border border-gray-300 rounded-lg overflow-hidden p-2 text-center shadow-sm flex items-center space-x-2 cursor-grab transition-opacity duration-150",
                            {
                                "opacity-50": draggingId === section.id,
                                "ring-2 ring-blue-400 ring-offset-1":
                                    dragOverId === section.id &&
                                    draggingId !== section.id, // Highlight drop target
                                "cursor-grabbing": draggingId === section.id,
                            },
                        )}
                    >
                        <IconGripVertical
                            size={16}
                            className="text-gray-400 flex-shrink-0 group-hover:text-gray-600"
                        />
                        <p className="text-xs text-gray-700 truncate flex-grow text-left">
                            {section.name}
                        </p>
                        {/* Placeholder for aspect ratio visualization if added later */}
                        {/* <div style={{ aspectRatio: section.aspectRatio || 1, width: '20px', backgroundColor: 'lightblue' }}></div> */}
                    </div>
                ))
            )}
        </div>
    );
};

export default SectionMinimap;
