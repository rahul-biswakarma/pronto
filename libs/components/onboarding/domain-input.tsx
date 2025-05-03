"use client";

import { Input } from "@/libs/ui/input";
import { useOnboarding } from "./context";

export function DomainInput() {
    const { state, setDomain } = useOnboarding();
    const { domainStatus } = state;

    return (
        <div>
            <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700"
            >
                Domain
            </label>
            <div className="mt-1 relative">
                <Input
                    id="domain"
                    type="text"
                    value={state.domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="my-website"
                    className={`${domainStatus.available === false ? "border-red-500" : domainStatus.available === true ? "border-green-500" : ""}`}
                    required
                />
                {domainStatus.message && (
                    <p
                        className={`mt-1 text-sm ${domainStatus.available ? "text-green-600" : "text-red-600"}`}
                    >
                        {domainStatus.message}
                    </p>
                )}
            </div>
        </div>
    );
}
