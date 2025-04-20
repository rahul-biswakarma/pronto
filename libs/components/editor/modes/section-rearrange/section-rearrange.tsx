import logger from "@/libs/utils/logger";
import { IconDragDrop } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ModerActionRenderer } from "../../_components/moder-action-renderer";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";
import SectionMinimap from "./section-minimap";
import { SECTION_ID_PREFIX, getAllSections } from "./utils";

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

const SectionRearrange: React.FC = () => {
    const { iframeDocument, onHtmlChange } = useEditor();
    const [hasChanges, setHasChanges] = useState(false);
    const [sectionsData, setSectionsData] = useState<
        { id: string; name: string }[]
    >([]);

    // Function to update sections data state from iframe
    const updateSectionsData = useCallback(() => {
        if (iframeDocument) {
            setSectionsData(getSectionsData(iframeDocument));
        }
    }, [iframeDocument]);

    // Initial load and refresh on iframe change
    useLayoutEffect(() => {
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
        (newOrderedIds: string[]) => {
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
                const sectionElement = sectionMap.get(id);
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

    // We no longer directly manipulate the iframe for dragging here
    // The enable/disable and iframe event listeners are removed.

    return (
        <div className="space-y-1 w-[600px] bg-[#f5f5f5]">
            <h3 className="text-sm font-medium p-3 pb-0">Section Rearrange</h3>
            <p className="text-xs text-gray-600 px-3 mb-4">
                Drag and drop section blocks below to rearrange the layout in
                the preview.
            </p>
            {/* Render the minimap, passing the data and the reorder handler */}
            <SectionMinimap sections={sectionsData} onReorder={handleReorder} />
        </div>
    );
};

// Register the section rearrange mode
export const SectionRearrangeMode = (): EditorMode => {
    return {
        id: "section-rearrange",
        label: "Section Rearrange",
        editorRenderer: () => <SectionRearrange />,
        actionRenderer: (isActive: boolean) => (
            <ModerActionRenderer
                icon={IconDragDrop}
                label="Section Rearrange"
                active={isActive}
            />
        ),
    };
};
