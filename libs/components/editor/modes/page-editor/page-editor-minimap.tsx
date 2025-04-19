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
    const [sectionsData, setSectionsData] = useState<
        { id: string; name: string }[]
    >([]);
    const [items, setItems] = useState(getMockItems());

    // Function to update sections data state from iframe
    const updateSectionsData = useCallback(() => {
        if (iframeDocument) {
            setSectionsData(getSectionsData(iframeDocument));
        }
    }, [iframeDocument]);

    // Initial load and refresh on iframe change
    useEffect(() => {
        updateSectionsData();
    }, [updateSectionsData]); // iframeDocument dependency is implicit in updateSectionsData

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

    // Function called by Minimap to reorder sections in the iframe
    const handleReorder = useCallback(
        (newOrderedIds: { id: string; name: string }[]) => {
            if (!iframeDocument) return;

            const parent = iframeDocument.body; // Or the main container if sections aren't direct children
            if (!parent) return;

            // Create a map for quick lookup using for...of
            const sectionMap = new Map<string, HTMLElement>();
            for (const sec of getAllSections(iframeDocument)) {
                if (sec.id) {
                    sectionMap.set(sec.id, sec);
                }
            }

            // Re-append sections in the new order using for...of
            let successfullyReordered = false;
            for (const id of newOrderedIds) {
                const sectionElement = sectionMap.get(id.id);
                if (sectionElement) {
                    parent.appendChild(sectionElement); // Appending moves the element
                    successfullyReordered = true;
                } else {
                    logger.warn(
                        `Section with ID "${id}" not found in iframe for reordering.`,
                    );
                }
            }

            if (successfullyReordered) {
                setHasChanges(true);
                // Update the minimap state to reflect the potentially filtered/successful reorder
                // We might not need to call updateSectionsData here if the minimap's internal state
                // already matches the newOrderedIds accurately. Calling it ensures consistency
                // if the iframe DOM manipulation failed for some sections.
                updateSectionsData();
            }
        },
        [iframeDocument, updateSectionsData],
    );

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
