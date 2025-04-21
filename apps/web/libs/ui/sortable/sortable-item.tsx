import type {
    DraggableAttributes,
    DraggableSyntheticListeners,
    UniqueIdentifier,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { createContext, useContext, useMemo } from "react";
import type { PropsWithChildren } from "react";

import "./sortable.css";

interface Props {
    id: UniqueIdentifier;
}

interface Context {
    attributes?: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
    attributes: undefined,
    listeners: undefined,
    ref() {},
});

export function SortableItem({ children, id }: PropsWithChildren<Props>) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef } =
        useSortable({ id });

    const context = useMemo(
        () => ({
            attributes,
            listeners,
            ref: setActivatorNodeRef,
        }),
        [attributes, listeners, setActivatorNodeRef],
    );

    return (
        <SortableItemContext.Provider value={context}>
            <li className="SortableItem" ref={setNodeRef}>
                {children}
            </li>
        </SortableItemContext.Provider>
    );
}

export function DragHandle() {
    const { attributes, listeners, ref } = useContext(SortableItemContext);

    return (
        <button className="DragHandle" {...attributes} {...listeners} ref={ref}>
            <svg viewBox="0 0 20 20" width="12">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
        </button>
    );
}
