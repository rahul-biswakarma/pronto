import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/libs/ui/accordion";
import type { ColorVariable } from "../types";

interface ThemeCustomizationProps {
    colorVariables: ColorVariable[];
    onColorChange: (name: string, value: string) => void;
}

/**
 * Component for customizing individual color variables in a theme
 */
export const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({
    colorVariables,
    onColorChange,
}) => {
    if (colorVariables.length === 0) return null;

    return (
        <Accordion type="single" collapsible className="w-full px-1.5 pb-1">
            <AccordionItem value="customize-colors" className="border-b-0">
                <AccordionTrigger className="py-2 px-1.5 text-xs cursor-pointer hover:no-underline rounded-md hover:bg-muted transition-colors font-medium text-muted-foreground [&[data-state=open]>svg]:rotate-180">
                    Customize Theme
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-1 px-1.5">
                    {colorVariables.map((variable) => (
                        <div
                            key={variable.name}
                            className="flex items-center justify-between gap-4 py-1.5 hover:bg-muted/30 border-b last:border-b-0 first:border-t px-1.5"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs truncate font-medium">
                                    {variable.displayName}
                                </span>
                            </div>
                            <div className="relative h-6 w-8 border rounded overflow-hidden flex-shrink-0">
                                <input
                                    type="color"
                                    value={variable.value}
                                    onChange={(e) =>
                                        onColorChange(
                                            variable.name,
                                            e.target.value,
                                        )
                                    }
                                    className="absolute object-cover scale-200 w-full h-full cursor-pointer border-none appearance-none bg-transparent"
                                    title={`Select color for ${variable.displayName}`}
                                />
                            </div>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
