"use client";

import { Input } from "@/libs/ui/input";
import { useOnboarding } from "./context";

export function WebsiteNameInput() {
    const { state, setWebsiteName } = useOnboarding();

    return (
        <div>
            <label
                htmlFor="websiteName"
                className="block text-sm font-medium text-gray-700"
            >
                Website Name
            </label>
            <Input
                id="websiteName"
                type="text"
                value={state.websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="My Awesome Website"
                className="mt-1"
                required
            />
        </div>
    );
}
