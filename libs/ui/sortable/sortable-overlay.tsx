import { DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import type { DropAnimation } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.4",
            },
        },
    }),
};

type Props = {
    children: React.ReactNode;
};

export function SortableOverlay({ children }: PropsWithChildren<Props>) {
    return (
        <DragOverlay dropAnimation={dropAnimationConfig}>
            {children}
        </DragOverlay>
    );
}
