import { useCallback, useEffect, useState } from "react";

import { SortableList } from "@/libs/ui/sortable/sortable";
import logger from "@/libs/utils/logger";

import { useEditor } from "../../editor.context";
import { SECTION_ID_PREFIX, getAllSections } from "../section-rearrange/utils";

import {
    restrictToFirstScrollableAncestor,
    restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

export function createRange<T>(
    length: number,
    initializer: (index: number) => T,
): T[] {
    return [...new Array(length)].map((_, index) => initializer(index));
}

function getMockItems() {
    return createRange(7, (index) => ({ id: index + 1 }));
}

// Helper function to extract section data
const getSectionsData = (doc: Document): { id: string; name: string }[] => {
    const sections = getAllSections(doc);
    return sections.map((section, index) => {
        const id = section.id || `${SECTION_ID_PREFIX}${index}`;
        if (!section.id) {
            section.id = id;
        }

        let name = `Section ${index + 1}`; // Default name

        if (id.startsWith("feno-sec-")) {
            const derivedName = id
                .substring("feno-sec-".length) // Remove prefix
                .replace(/-/g, " ") // Replace hyphens with spaces
                .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
            if (derivedName) {
                // Use derived name if not empty
                name = derivedName;
            }
        } else {
            // Fallback to heading or data-name if ID doesn't match pattern
            const heading = section.querySelector("h1, h2, h3, h4, h5, h6");
            name = heading?.textContent?.trim() || section.dataset.name || name; // Keep default if others fail
        }

        // Optionally: Add aspect ratio calculation here if needed later
        // const rect = section.getBoundingClientRect();
        // const aspectRatio = rect.width && rect.height ? rect.width / rect.height : 1;
        return { id, name /*, aspectRatio */ };
    });
};

export const PageEditorMinimap = () => {
    const { iframeDocument, onHtmlChange } = useEditor();
    const [hasChanges, setHasChanges] = useState(false);
    const [items, setItems] = useState(getMockItems());

    // Save changes on unmount if changes were made
    useEffect(() => {
        return () => {
            if (hasChanges && iframeDocument) {
                onHtmlChange({
                    html: iframeDocument.documentElement.outerHTML,
                    modeId: "section-rearrange",
                    modeLabel: "Section Rearrange",
                });
            }
        };
    }, [hasChanges, iframeDocument, onHtmlChange]);


    return (
        <div className="relative" style={{ maxWidth: 400 }}>
            <SortableList
                items={items}
                onChange={setItems}
                renderItem={(item) => (
                    <SortableList.Item id={item.id}>
                        {item.id}
                        <SortableList.DragHandle />
                    </SortableList.Item>
                )}
                modifiers={[
                    restrictToVerticalAxis,
                    restrictToFirstScrollableAncestor,
                ]}
            />
        </div>
    );
};
