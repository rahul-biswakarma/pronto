"use client";

import type { Version } from "@/libs/services/version-history.service";
import { Button } from "@/libs/ui/button";
import { History } from "lucide-react";
import { useState } from "react";
import { EDITOR_MODES } from "../../constants";
import { useEditorContext } from "../../editor.context";

export function VersionHistoryPanel() {
    const { versions, restoreVersion, setActiveMode } = useEditorContext();

    const [selectedVersion, setSelectedVersion] = useState<Version | null>(
        null,
    );
    const [confirmRestore, setConfirmRestore] = useState(false);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const handleRestore = async (version: Version) => {
        if (confirmRestore) {
            await restoreVersion(version.id);
            setConfirmRestore(false);
            setSelectedVersion(null);
        } else {
            setSelectedVersion(version);
            setConfirmRestore(true);
        }
    };

    return (
        <div className="w-full h-fit max-w-screen-sm mx-auto absolute bottom-2 left-1/2 -translate-x-1/2 bg-green-500/20 backdrop-blur-sm p-1 rounded-2xl">
            <div className="flex flex-col gap-4 bg-background rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <History className="mr-2 size-5" />
                        Version History
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveMode(EDITOR_MODES.DEFAULT)}
                    >
                        Exit
                    </Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-3">
                    {versions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No versions saved yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className={`border rounded-lg p-3 ${selectedVersion?.id === version.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">
                                                {version.label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(version.timestamp)}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRestore(version)
                                            }
                                            className={`px-3 py-1 rounded-md text-sm ${selectedVersion?.id === version.id ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                                        >
                                            {selectedVersion?.id ===
                                                version.id && confirmRestore
                                                ? "Confirm Restore"
                                                : "Restore"}
                                        </button>
                                    </div>

                                    {selectedVersion?.id === version.id &&
                                        confirmRestore && (
                                            <div className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                                                Restoring this version will
                                                replace your current work. Click
                                                "Confirm Restore" to continue or
                                                select a different version to
                                                cancel.
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between">
                    <div className="text-sm text-gray-500">
                        {versions.length} version
                        {versions.length !== 1 ? "s" : ""} saved
                    </div>
                </div>
            </div>
        </div>
    );
}
