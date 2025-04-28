import { Button } from "@/libs/ui/button";
import { Checkbox } from "@/libs/ui/checkbox";
import { Input } from "@/libs/ui/input";
import { Label } from "@/libs/ui/label";
import { Textarea } from "@/libs/ui/textarea";
import {
    IconArrowDown,
    IconArrowUp,
    IconCheck,
    IconPlus,
    IconX,
} from "@tabler/icons-react";
import type { z } from "zod";
import type { BlockInfo } from "../block-registry";

interface BlockConfigurationPanelProps {
    block: BlockInfo;
    config: unknown;
    onConfigChange: (newConfig: unknown) => void;
    onInsert: () => void;
    onCancel: () => void;
    insertPosition: "before" | "after" | "append";
}

// Define types for Zod schema processing
type ZodShape = Record<string, z.ZodTypeAny>;
type ConfigValue =
    | string
    | number
    | boolean
    | Record<string, unknown>[]
    | Record<string, unknown>;

export const BlockConfigurationPanel: React.FC<
    BlockConfigurationPanelProps
> = ({ block, config, onConfigChange, onInsert, onCancel, insertPosition }) => {
    // Create a typed version of config based on the block schema
    const typedConfig = config as Record<string, ConfigValue>;

    // Handler for input changes
    const handleInputChange = (key: string, value: ConfigValue) => {
        onConfigChange({
            ...typedConfig,
            [key]: value,
        });
    };

    // Get position text for UI
    const getPositionText = () => {
        switch (insertPosition) {
            case "before":
                return "Insert before selected element";
            case "after":
                return "Insert after selected element";
            case "append":
                return "Insert inside selected element";
            default:
                return "Insert block";
        }
    };

    // Get position icon
    const getPositionIcon = () => {
        switch (insertPosition) {
            case "before":
                return <IconArrowUp size={16} />;
            case "after":
                return <IconArrowDown size={16} />;
            case "append":
                return <IconPlus size={16} />;
            default:
                return <IconCheck size={16} />;
        }
    };

    // Dynamically render form fields based on the schema
    const renderFormFields = () => {
        const schema = block.configSchema;
        const shape = (schema as z.ZodObject<ZodShape>)._def.shape();

        return Object.entries(shape).map(
            ([key, fieldSchema]: [string, z.ZodTypeAny]) => {
                const type = fieldSchema._def.typeName;
                const value = typedConfig[key];

                // Generate field based on zod type
                switch (type) {
                    case "ZodString":
                        return (
                            <div key={key} className="mb-4">
                                <Label
                                    htmlFor={key}
                                    className="block mb-1 capitalize"
                                >
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                {key.includes("description") ||
                                (typeof value === "string" &&
                                    value.length > 50) ? (
                                    <Textarea
                                        id={key}
                                        value={(value as string) || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                key,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full"
                                        rows={3}
                                    />
                                ) : (
                                    <Input
                                        id={key}
                                        value={(value as string) || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                key,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full"
                                    />
                                )}
                            </div>
                        );

                    case "ZodNumber":
                        return (
                            <div key={key} className="mb-4">
                                <Label
                                    htmlFor={key}
                                    className="block mb-1 capitalize"
                                >
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                <Input
                                    type="number"
                                    id={key}
                                    value={(value as number) || 0}
                                    onChange={(e) =>
                                        handleInputChange(
                                            key,
                                            Number.parseFloat(e.target.value),
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                        );

                    case "ZodBoolean":
                        return (
                            <div
                                key={key}
                                className="flex items-center space-x-2 mb-4"
                            >
                                <Checkbox
                                    id={key}
                                    checked={(value as boolean) || false}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(key, !!checked)
                                    }
                                />
                                <Label htmlFor={key} className="capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                            </div>
                        );

                    case "ZodArray":
                        // Simple handling for array fields
                        if (key === "testimonials" && Array.isArray(value)) {
                            return (
                                <div
                                    key={key}
                                    className="mb-4 border rounded-md p-4"
                                >
                                    <Label className="block mb-2 font-medium capitalize">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </Label>

                                    {(value as Record<string, unknown>[]).map(
                                        (item, index) => (
                                            <div
                                                key={`${key}-${item.name ? String(item.name).substring(0, 10) : ""}-${index}`}
                                                className="mb-4 border-b pb-4 last:border-0"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">
                                                        Item {index + 1}
                                                    </h4>
                                                </div>

                                                {Object.entries(item).map(
                                                    ([itemKey, itemValue]) => (
                                                        <div
                                                            key={itemKey}
                                                            className="mb-2"
                                                        >
                                                            <Label
                                                                htmlFor={`${key}-${index}-${itemKey}`}
                                                                className="block mb-1 text-sm capitalize"
                                                            >
                                                                {itemKey
                                                                    .replace(
                                                                        /([A-Z])/g,
                                                                        " $1",
                                                                    )
                                                                    .trim()}
                                                            </Label>
                                                            {itemKey ===
                                                            "content" ? (
                                                                <Textarea
                                                                    id={`${key}-${index}-${itemKey}`}
                                                                    value={
                                                                        (itemValue as string) ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newArray =
                                                                            [
                                                                                ...value,
                                                                            ] as Record<
                                                                                string,
                                                                                unknown
                                                                            >[];
                                                                        newArray[
                                                                            index
                                                                        ] = {
                                                                            ...newArray[
                                                                                index
                                                                            ],
                                                                            [itemKey]:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        };
                                                                        handleInputChange(
                                                                            key,
                                                                            newArray,
                                                                        );
                                                                    }}
                                                                    className="w-full text-sm"
                                                                    rows={3}
                                                                />
                                                            ) : (
                                                                <Input
                                                                    id={`${key}-${index}-${itemKey}`}
                                                                    value={
                                                                        (itemValue as string) ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newArray =
                                                                            [
                                                                                ...value,
                                                                            ] as Record<
                                                                                string,
                                                                                unknown
                                                                            >[];
                                                                        newArray[
                                                                            index
                                                                        ] = {
                                                                            ...newArray[
                                                                                index
                                                                            ],
                                                                            [itemKey]:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        };
                                                                        handleInputChange(
                                                                            key,
                                                                            newArray,
                                                                        );
                                                                    }}
                                                                    className="w-full text-sm"
                                                                />
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            );
                        }
                        return null;

                    default:
                        return null;
                }
            },
        );
    };

    return (
        <div className="bg-[var(--feno-surface-1)] rounded-lg shadow-sm border border-[var(--feno-border-1)]">
            <div className="p-4 border-b border-[var(--feno-border-1)]">
                <h2 className="text-lg font-medium">
                    {block.name} Configuration
                </h2>
                <p className="text-sm text-muted-foreground">
                    {block.description}
                </p>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
                {renderFormFields()}
            </div>

            <div className="p-4 border-t border-[var(--feno-border-1)] flex justify-between">
                <Button variant="outline" onClick={onCancel}>
                    <IconX size={16} className="mr-2" /> Cancel
                </Button>

                <Button onClick={onInsert}>
                    {getPositionIcon()}
                    <span className="ml-2">{getPositionText()}</span>
                </Button>
            </div>
        </div>
    );
};
