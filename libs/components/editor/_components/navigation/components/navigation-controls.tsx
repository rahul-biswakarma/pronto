"use client";

import { Button } from "@/libs/ui/button";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";

export const NavigationControls = () => (
    <div className="flex items-center">
        <Button
            variant="custom"
            size="icon"
            className="flex gap-1 items-center"
        >
            <IconArrowBackUp strokeWidth={2} />
        </Button>
        <Button
            variant="custom"
            size="icon"
            className="flex gap-1 items-center"
        >
            <IconArrowForwardUp strokeWidth={2} />
        </Button>
    </div>
);
