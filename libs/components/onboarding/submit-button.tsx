"use client";

import { Button } from "@/libs/ui/button";
import { useOnboarding } from "./context";

export function SubmitButton() {
    const { state } = useOnboarding();

    return (
        <Button
            type="submit"
            className="w-full"
            disabled={
                state.isLoading ||
                state.domainStatus.checking ||
                state.domainStatus.available === false
            }
        >
            {state.isLoading ? "Creating..." : "Continue"}
        </Button>
    );
}
