"use client";

import { Button } from "@/libs/ui/button";
import { Input } from "@/libs/ui/input";
import { useState } from "react";
import { useOnboarding } from "./context";

export function CollaboratorInput() {
    const { state, addCollaborator, removeCollaborator } = useOnboarding();
    const [newEmail, setNewEmail] = useState("");

    const handleAddCollaborator = () => {
        addCollaborator(newEmail);
        setNewEmail("");
    };

    return (
        <div>
            <label
                htmlFor="collaborators"
                className="block text-sm font-medium text-gray-700"
            >
                Invite Collaborators (Optional)
            </label>
            <div className="mt-1 flex">
                <Input
                    id="collaborators"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="flex-grow"
                />
                <Button
                    type="button"
                    onClick={handleAddCollaborator}
                    className="ml-2"
                    variant="secondary"
                >
                    Add
                </Button>
            </div>
            {state.collaboratorEmails.length > 0 && (
                <div className="mt-3 space-y-2">
                    {state.collaboratorEmails.map((email) => (
                        <div
                            key={email}
                            className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                        >
                            <span className="text-sm">{email}</span>
                            <button
                                type="button"
                                onClick={() => removeCollaborator(email)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
