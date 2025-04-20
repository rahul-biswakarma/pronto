import { useEffect, useState } from "react";

import { SortableList } from "@/libs/ui/sortable/sortable";

import { useEditor } from "../../editor.context";
import {} from "../section-rearrange/utils";

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

export const PageEditorMinimap = () => {
    const { iframeDocument, onHtmlChange } = useEditor();
    const [items, setItems] = useState(getMockItems());

    // Save changes on unmount if changes were made
    useEffect(() => {
        return () => {
            if (iframeDocument) {
                onHtmlChange({
                    html: iframeDocument.documentElement.outerHTML,
                    modeId: "section-rearrange",
                    modeLabel: "Section Rearrange",
                });
            }
        };
    }, [iframeDocument, onHtmlChange]);

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
