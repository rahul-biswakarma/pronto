"use client";

import * as React from "react";

import { Button } from "@/libs/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/libs/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/libs/ui/popover";
import { cn } from "@/libs/utils/misc";
import { IconCheck, IconChevronsDownLeft } from "@tabler/icons-react";

const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
];

export function ComboboxDemo() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? frameworks.find(
                              (framework) => framework.value === value,
                          )?.label
                        : "Select framework..."}
                    <IconChevronsDownLeft className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search framework..."
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue) => {
                                        setValue(
                                            currentValue === value
                                                ? ""
                                                : currentValue,
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    {framework.label}
                                    <IconCheck
                                        className={cn(
                                            "ml-auto",
                                            value === framework.value
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
