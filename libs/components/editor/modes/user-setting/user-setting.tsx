import { createSupabaseBrowserClient } from "@/libs/supabase/client/browser";
import { supabaseOption } from "@/libs/supabase/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/libs/ui/avatar";
import { Button } from "@/libs/ui/button";
import { Input } from "@/libs/ui/input";
import { Label } from "@/libs/ui/label";
import { Separator } from "@/libs/ui/separator";
import { Switch } from "@/libs/ui/switch";
import { cn } from "@/libs/utils/misc";
import type { User } from "@supabase/supabase-js";
import { IconBrandGoogle, IconUserCircle } from "@tabler/icons-react"; // Placeholder icon
import { useCallback, useState } from "react";
import type React from "react";
import { useEditor } from "../../editor.context";
import type { EditorMode } from "../../types/editor.types";

interface ProfileData {
    id: string;
    email?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    domain?: string | null;
    // Add other fields from your 'profiles' table if needed
}

const ProfileSettings: React.FC = () => {
    const { portfolioId, user } = useEditor();

    const [domain, setDomain] = useState("");
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(
        null,
    );
    const [domainCheckLoading, setDomainCheckLoading] = useState(false);

    const supabase = createSupabaseBrowserClient(supabaseOption);

    // --- Domain Check ---
    const checkDomainAvailability = useCallback(
        async (currentDomain: string) => {
            if (!currentDomain || currentDomain.length < 3) {
                setDomainAvailable(null);
                return;
            }
            // Don't re-check if it's the user's current domain
            if (profile?.domain === currentDomain) {
                setDomainAvailable(true);
                return;
            }

            setDomainCheckLoading(true);
            setDomainAvailable(null); // Reset while checking
            try {
                // Option 1: Direct query (if RLS allows checking other domains)
                // const { data, error } = await supabase
                //     .from('profiles')
                //     .select('id')
                //     .eq('domain', currentDomain)
                //     .limit(1);
                // if (error) throw error;
                // setDomainAvailable(data.length === 0);

                // Option 2: Edge Function (more secure if RLS is strict)
                const { data, error } = await supabase.functions.invoke(
                    "check-domain",
                    {
                        body: { domain: currentDomain },
                    },
                );
                if (error) throw error;
                setDomainAvailable(data.available);
            } catch (err) {
                console.error("Error checking domain:", err); // Optional: Log the error
                setDomainAvailable(null); // Indicate check failed or uncertain
            } finally {
                setDomainCheckLoading(false);
            }
        },
        [profile?.domain, supabase],
    );

    // --- Actions ---
    const handleSave = async () => {
        if (!profile) return;
        // 2. Check domain validity before saving
        if (domain !== profile.domain) {
            if (!domain || domain.length < 3) {
                setError("Domain must be at least 3 characters long.");
                return;
            }
            if (domainAvailable === false) {
                setError("Domain is not available.");
                return;
            }
            // Re-trigger check just to be sure if the user hasn't blurred etc.
            await checkDomainAvailability(domain);
            if (!domainAvailable) {
                // Check the state after the await
                setError("Domain is not available or check failed.");
                return;
            }
        }

        // 3. Save profile data (Full Name, Domain)
        setSaving(true);
        setError(null);
        try {
            const updates: {
                full_name: string;
                domain?: string | null; // Make domain optional
                updated_at: string;
            } = {
                full_name: fullName,
                updated_at: new Date().toISOString(),
                // Don't include domain initially
            };

            // Only include domain if it actually changed
            if (domain !== profile.domain) {
                updates.domain = domain || null; // Add it if changed
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", profile.id);

            if (updateError) {
                if (
                    updateError.message.includes(
                        'duplicate key value violates unique constraint "profiles_domain_key"',
                    )
                ) {
                    setError("Domain is already taken.");
                    setDomainAvailable(false);
                } else {
                    throw updateError;
                }
            } else {
                // Update local state optimistically or refetch
                setProfile((prev) =>
                    prev
                        ? {
                              ...prev,
                              ...updates,
                              domain: updates.domain ?? prev.domain,
                          }
                        : null,
                );
                // Reset changed state if needed
            }
        } catch (err) {
            setError((err as Error).message || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        setError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            window.location.reload();
        } catch (err) {
            setError((err as Error).message || "Logout failed.");
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading profile...</div>;
    }

    if (error && !saving && !deleting) {
        // Don't show general load error if saving/deleting fails (they show specific errors)
        return (
            <div className="p-4 text-red-600 text-center">Error: {error}</div>
        );
    }

    if (!profile) {
        return (
            <div className="p-4 text-center">
                Could not load profile. Are you logged in?
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-3xl mx-auto bg-card text-card-foreground rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs font-medium rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Change
                        </label>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">
                            {user.user_metadata.full_name || "User Profile"}
                        </h2>
                        {/* Optionally show username or other static info */}
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={
                        saving ||
                        loading ||
                        domainCheckLoading ||
                        domainAvailable === false
                    }
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
            {/* Profile Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b pb-2">Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username (Display Only) */}
                    <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={profile.domain || ""}
                            disabled
                            className="mt-1 bg-muted/50"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            This is your unique subdomain.
                        </p>
                    </div>

                    {/* Email (Display Only with Provider Icon) */}
                    <div>
                        <Label>Email</Label>
                        <div className="flex items-center justify-between mt-1 border rounded-md px-3 py-2 bg-muted/50">
                            <span>{profile.email}</span>
                            {/* TODO: Detect provider dynamically */}
                            {profile.email?.endsWith("@gmail.com") && (
                                <IconBrandGoogle
                                    size={20}
                                    className="text-muted-foreground"
                                />
                            )}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1"
                            disabled={saving || loading}
                        />
                    </div>

                    {/* Domain Name */}
                    <div>
                        <Label htmlFor="domain">Domain Name</Label>
                        <div className="relative mt-1">
                            <Input
                                id="domain"
                                value={domain}
                                onChange={(e) => {
                                    const newDomain = e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, ""); // Basic sanitization
                                    setDomain(newDomain);
                                    setDomainAvailable(null); // Reset availability on change
                                    // Optional: Debounce the check
                                    // checkDomainAvailability(newDomain);
                                }}
                                onBlur={() => checkDomainAvailability(domain)} // Check on blur
                                className={cn(
                                    domainAvailable === true &&
                                        domain !== profile?.domain &&
                                        "border-green-500 focus-visible:ring-green-500",
                                    domainAvailable === false &&
                                        "border-red-500 focus-visible:ring-red-500",
                                )}
                                disabled={
                                    saving || loading || domainCheckLoading
                                }
                                placeholder="your-unique-name"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                {window.location.hostname}/
                            </span>{" "}
                            {/* Adjust based on your actual domain structure */}
                        </div>
                        {domainCheckLoading && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Checking availability...
                            </p>
                        )}
                        {domainAvailable === true &&
                            domain !== profile?.domain && (
                                <p className="text-sm text-green-600 mt-1">
                                    Domain is available!
                                </p>
                            )}
                        {domainAvailable === false && (
                            <p className="text-sm text-red-600 mt-1">
                                Domain is not available.
                            </p>
                        )}
                        {!domainCheckLoading &&
                            domainAvailable === null &&
                            domain.length > 0 &&
                            domain !== profile?.domain && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Leave field to check availability.
                                </p>
                            )}
                        {domain.length > 0 && domain.length < 3 && (
                            <p className="text-sm text-yellow-600 mt-1">
                                Domain must be at least 3 characters.
                            </p>
                        )}
                    </div>

                    {/* Hide Modul Badge (Example Toggle) */}
                    <div className="flex items-center justify-between border rounded-md p-3 bg-background">
                        <div>
                            <Label htmlFor="hideBadge" className="font-medium">
                                Hide Modul Badge
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Remove Modul Branding
                            </p>
                        </div>
                        <Switch id="hideBadge" />{" "}
                        {/* TODO: Add state and logic */}
                    </div>
                </div>
            </div>
            <Separator />
            {/* Account Settings Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Account Settings</h3>
                {/* Logout */}
                <div className="flex items-center justify-between border rounded-md p-4 bg-background">
                    <div>
                        <p className="font-medium">Account</p>
                        <p className="text-sm text-muted-foreground">
                            {profile.email}
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Log out
                    </Button>
                </div>
                {/* Delete Account */}
                <div className="flex items-center justify-between border border-destructive/50 rounded-md p-4 bg-destructive/5 text-destructive">
                    <div>
                        <p className="font-semibold text-red-600">
                            Delete Account
                        </p>
                        <p className="text-sm text-red-600/90">
                            Dangerous Zone: Permanently delete your account and
                            all associated data.
                        </p>
                    </div>
                </div>
                {error && (saving || deleting) && (
                    <p className="text-sm text-red-600 text-center mt-2">
                        {error}
                    </p>
                )}{" "}
                {/* Show save/delete specific errors here */}
            </div>
        </div>
    );
};

// Register the profile settings mode
export const ProfileSettingsMode = (user: User): EditorMode => {
    return {
        id: "profile-settings",
        label: "Profile",
        editorRenderer: () => <ProfileSettings />,
        actionRenderer: () => (
            <Avatar>
                <AvatarImage
                    sizes="18px"
                    src={user.user_metadata.avatar_url || undefined}
                />
                <AvatarFallback className="text-[14px]">
                    {user.user_metadata.full_name ? (
                        user.user_metadata.full_name.charAt(0).toUpperCase()
                    ) : (
                        <IconUserCircle size={28} />
                    )}
                </AvatarFallback>
            </Avatar>
        ),
    };
};
