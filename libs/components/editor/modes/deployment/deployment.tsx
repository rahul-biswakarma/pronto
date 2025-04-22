import { Button } from "@/libs/ui/button"; // Assuming Button component exists
import { Input } from "@/libs/ui/input"; // Assuming Input component exists
import dataLayer from "@/libs/utils/data-layer";
import { updateFileInBucket } from "@/libs/utils/supabase-storage";
import { useEffect, useState } from "react";
import { useEditor } from "../../editor.context";
// Assume supabase client and project context are available via hooks
// import { useSupabaseClient } from '@supabase/auth-helpers-react';
// import { useProject } from '@/hooks/useProject'; // Example hook

const DeploymentEditor = () => {
    const [domain, setDomain] = useState<string | null>(null);
    const [defaultDomain, setDefaultDomain] = useState<string | null>(null);

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { portfolio, iframeDocument } = useEditor();

    useEffect(() => {
        setDefaultDomain(portfolio.domain ?? null);
    }, [portfolio]);

    const handleUpdateDomain = async () => {
        setIsLoading(true);
        setMessage("");
        if (!domain) {
            setMessage("Please enter a domain.");
            setIsLoading(false);
            return;
        }

        const { data } = (await dataLayer.post("/api/portfolios", {
            id: portfolio.id,
            domain: domain,
        })) as { data: { success: boolean } };

        if (!data?.success) {
            console.error("Supabase update error:");
            setMessage("Failed to update domain");
        } else {
            setDomain(domain);
            setDefaultDomain(domain);
        }

        setIsLoading(false);
    };

    const handleDeploy = async () => {
        setIsLoading(true);
        setMessage("");

        const success = await updateFileInBucket(
            portfolio.html_s3_path ?? "",
            iframeDocument?.body.outerHTML ?? "",
        );

        if (success) {
            setMessage("Deployment successful");
        } else {
            setMessage("Deployment failed");
        }

        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col min-w-[500px] gap-3 border border-gray-200 rounded-xl bg-white">
            <h3 className="text-lg font-semibold">Deployment Settings</h3>
            <p className="text-sm text-neutral-600">
                Set a custom domain for your hosted portfolio.
            </p>
            <div className="flex gap-2 items-end">
                <div className="flex-grow">
                    <label
                        htmlFor="domain-input"
                        className="text-xs font-medium mb-1 block"
                    >
                        Domain Name
                    </label>
                    <Input
                        id="domain-input"
                        type="text"
                        placeholder="domain.feno.app"
                        value={domain ?? ""}
                        onChange={(e) => setDomain(e.target.value.trim())}
                        disabled={isLoading}
                        className="w-full"
                    />
                </div>
                <Button
                    onClick={handleUpdateDomain}
                    disabled={isLoading || domain === defaultDomain || !domain}
                >
                    {isLoading ? "Updating..." : "Update"}
                </Button>
            </div>
            {message && (
                <p
                    className={`text-sm ${
                        message.includes("Error") || message.includes("exists")
                            ? "text-red-600"
                            : "text-green-600"
                    }`}
                >
                    {message}
                </p>
            )}
            {defaultDomain && (
                <Button variant="outline" size="sm" onClick={handleDeploy}>
                    Deploy
                </Button>
            )}
        </div>
    );
};

export const DeploymentMode = () => ({
    id: "deployment",
    actionRenderer: () => (
        <Button variant="outline" size="sm">
            Deploy
        </Button>
    ),
    editorRenderer: () => <DeploymentEditor />,
});
