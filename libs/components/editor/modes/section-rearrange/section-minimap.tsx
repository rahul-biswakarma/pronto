import { cn } from "@/libs/utils/misc"; // Assuming you have this utility
import { IconGripVertical } from "@tabler/icons-react";
import { Reorder, useDragControls } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";

interface Section {
    id: string;
    name: string;
    // aspectRatio?: number; // Keep for future use
}

interface SectionItemProps {
    item: Section;
}

// Sub-component for individual reorderable items
const SectionItem: React.FC<SectionItemProps> = ({ item }) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            key={item.id}
            value={item}
            dragListener={false} // Use custom drag handle
            dragControls={dragControls}
            // Initial animation state
            initial={{ opacity: 0, y: 10 }}
            // Animation when item enters
            animate={{ opacity: 1, y: 0 }}
            // Animation when item exits (if needed, e.g., filtering)
            exit={{ opacity: 0, y: -10 }}
            // Layout animation for reordering
            layout
            transition={{ duration: 0.2 }}
            className={cn(
                "group bg-white border border-gray-300 rounded-lg overflow-hidden p-2 text-center shadow-sm flex items-center space-x-2",
                "cursor-grab active:cursor-grabbing", // Indicate grab state
            )}
            title={item.id}
        >
            <span
                onPointerDown={(e) => {
                    // Prevent default text selection behavior
                    e.preventDefault();
                    dragControls.start(e);
                }}
                className="cursor-grab active:cursor-grabbing touch-none" // Ensure touch works correctly
            >
                <IconGripVertical
                    size={16}
                    className="text-gray-400 flex-shrink-0 group-hover:text-gray-600"
                />
            </span>
            <p className="text-xs text-gray-700 truncate flex-grow text-left select-none">
                {item.name}
            </p>
        </Reorder.Item>
    );
};

interface SectionMinimapProps {
    sections: Section[];
    onReorder: (newOrderedIds: string[]) => void;
}

const SectionMinimap: React.FC<SectionMinimapProps> = ({
    sections: initialSections,
    onReorder,
}) => {
    const [sections, setSections] = useState<Section[]>(initialSections);

    // Update local state if the initial sections prop changes from parent
    useEffect(() => {
        setSections(initialSections);
    }, [initialSections]);

    const handleReorder = (newSections: Section[]) => {
        setSections(newSections);
        const newOrderedIds = newSections.map((sec) => sec.id);
        onReorder(newOrderedIds); // Notify parent component of the change
    };

    return (
        <div className="min-h-[10rem] overflow-y-auto p-3 pb-4 pt-1">
            {sections.length === 0 ? (
                <p className="text-xs text-gray-400 text-center italic py-4">
                    No sections found.
                </p>
            ) : (
                <Reorder.Group
                    axis="y"
                    values={sections}
                    onReorder={handleReorder}
                    className="space-y-1" // Add spacing between items
                >
                    {sections.map((section) => (
                        <SectionItem key={section.id} item={section} />
                    ))}
                </Reorder.Group>
            )}
        </div>
    );
};

export default SectionMinimap;
