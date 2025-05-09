import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { Active, Modifier, UniqueIdentifier } from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import React, { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { DragHandle, SortableItem } from "./sortable-item";
import { SortableOverlay } from "./sortable-overlay";

import "./sortable.css";

interface BaseItem {
    id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
    items: T[];
    onChange(items: T[]): void;
    renderItem(item: T): ReactNode;
    modifiers?: Modifier[];
}

export function SortableList<T extends BaseItem>({
    items,
    onChange,
    renderItem,
    modifiers,
}: Props<T>) {
    const [active, setActive] = useState<Active | null>(null);

    const activeItem = useMemo(
        () => items.find((item) => item.id === active?.id),
        [active, items],
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <DndContext
            modifiers={modifiers}
            sensors={sensors}
            onDragStart={({ active }) => {
                setActive(active);
            }}
            onDragEnd={({ active, over }) => {
                if (over && active.id !== over?.id) {
                    const activeIndex = items.findIndex(
                        ({ id }) => id === active.id,
                    );
                    const overIndex = items.findIndex(
                        ({ id }) => id === over.id,
                    );

                    onChange(arrayMove(items, activeIndex, overIndex));
                }
                setActive(null);
            }}
            onDragCancel={() => {
                setActive(null);
            }}
        >
            <SortableContext items={items}>
                <ul className="SortableList" role="application">
                    {items.map((item) => (
                        <React.Fragment key={item.id}>
                            {renderItem(item)}
                        </React.Fragment>
                    ))}
                </ul>
            </SortableContext>
            <SortableOverlay>
                {activeItem ? renderItem(activeItem) : null}
            </SortableOverlay>
        </DndContext>
    );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
