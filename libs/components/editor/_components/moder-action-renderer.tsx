import { Button } from "@/libs/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/libs/ui/tooltip";

import { cn } from "@/libs/utils/misc";

export const ModerActionRenderer = ({
    icon,
    label,
    active,
}: {
    icon: React.ElementType;
    label: string;
    active: boolean;
}) => {
    const Icon = icon;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon"
                    variant="custom"
                    className={cn(
                        "rounded-lg cursor-pointer hover:bg-background p-0 [&_svg:not([class*='size-'])]:size-[17px] [&_svg]:stroke-[1.8]",
                    )}
                >
                    <Icon size={16} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
};
