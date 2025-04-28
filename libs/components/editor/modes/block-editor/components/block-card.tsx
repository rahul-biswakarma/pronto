import { Button } from "@/libs/ui/button";
import {
    IconBlockquote,
    IconBrandMailgun,
    IconMessageCircle,
    IconPlus,
    IconQuote,
} from "@tabler/icons-react";
import type React from "react";
import type { BlockInfo } from "../block-registry";

interface BlockCardProps {
    block: BlockInfo;
    onSelect: (block: BlockInfo) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onSelect }) => {
    // Map the icon string to an actual icon component
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            mail: <IconBrandMailgun size={20} />,
            "message-circle": <IconMessageCircle size={20} />,
            quote: <IconQuote size={20} />,
            default: <IconBlockquote size={20} />,
        };

        return icons[iconName] || icons.default;
    };

    return (
        <div
            key={block.id}
            className="rounded-lg p-3 bg-[var(--feno-surface-0)] shadow-[var(--feno-minimal-shadow)] hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onSelect(block)}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-[var(--feno-surface-2)] p-2 rounded-md">
                        {getIconComponent(block.icon)}
                    </div>
                    <h3 className="font-medium">{block.name}</h3>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                    <IconPlus size={16} />
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">{block.description}</p>
        </div>
    );
};
