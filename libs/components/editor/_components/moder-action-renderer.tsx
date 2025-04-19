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
                    variant="ghost"
                    className={cn(
                        "text-foreground rounded-lg cursor-pointer hover:bg-background p-0.5 [&_svg:not([class*='size-'])]:size-[17px] [&_svg]:stroke-[1.2]",
                        active &&
                            "bg-background [&_svg]:stroke-foreground [&_svg]:stroke-[1.6]",
                    )}
                >
                    <Icon size={16} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
};
