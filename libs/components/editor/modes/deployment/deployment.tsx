import { Button } from "@/libs/ui/button";

const DeploymentEditor = () => {
    return (
        <div className="p-4 flex flex-col min-w-[500px] gap-3 border feno-mod-container">
            <h3 className="text-lg font-semibold">Deployment Settings</h3>
        </div>
    );
};

export const DeploymentMode = () => ({
    id: "deployment",
    actionRenderer: () => (
        <Button
            variant="custom"
            size="sm"
            className="border border-[var(--feno-border-1)] hover:border-[var(--feno-border-2)] hover:bg-[var(--feno-surface-1)]"
        >
            Publish
        </Button>
    ),
    editorRenderer: () => <DeploymentEditor />,
});
