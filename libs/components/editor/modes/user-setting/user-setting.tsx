import { SignOut } from "@/libs/components/auth/signout";
import { Avatar, AvatarFallback, AvatarImage } from "@/libs/ui/avatar";
import { cn } from "@/libs/utils/misc";
import type { User } from "@supabase/supabase-js";
import { IconUserCircle } from "@tabler/icons-react"; // Placeholder icon
import type React from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";

const ProfileSettings: React.FC = () => {
    const { user } = useEditor();

    return (
        <div className="p-6 space-y-8 w-full bg-card min-w-[600px] text-card-foreground rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                    <div className="relative group">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage
                                src={user.user_metadata.avatar_url || undefined}
                                alt={user.user_metadata.full_name || "User"}
                            />
                            <AvatarFallback className="text-xl">
                                {user.user_metadata.full_name ? (
                                    user.user_metadata.full_name
                                        .charAt(0)
                                        .toUpperCase()
                                ) : (
                                    <IconUserCircle size={32} />
                                )}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-semibold">
                                {user.user_metadata.full_name || "User Profile"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {user.user_metadata.email}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <SignOut />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UserSettings = () => {
    const { user } = useEditor();

    return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tl from-yellow-500 to-red-500 p-0.5">
            <Avatar
                className={cn(
                    "w-full h-full",
                    // isActive && "outline-2 outline-white",
                )}
            >
                <AvatarImage
                    className="object-cover object-center"
                    src={user.user_metadata.avatar_url || undefined}
                />
                <AvatarFallback className="text-[14px] bg-white !rounded-lg">
                    {user.user_metadata.full_name ? (
                        user.user_metadata.full_name.charAt(0).toUpperCase()
                    ) : (
                        <IconUserCircle size={28} />
                    )}
                </AvatarFallback>
            </Avatar>
        </div>
    );
};

// Register the profile settings mode
export const ProfileSettingsMode = (user: User): EditorMode => {
    return {
        id: "profile-settings",
        label: "Profile",
        editorRenderer: () => <ProfileSettings />,
        actionRenderer: (isActive) => <UserSettings />,
    };
};
