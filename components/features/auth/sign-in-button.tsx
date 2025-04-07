"use client";

import { supabaseOption } from "@/supabase/config";
import { Button } from "@radix-ui/themes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface SignInButtonProps {
    className?: string;
    variant?: "solid" | "outline" | "ghost";
    size?: "1" | "2" | "3" | "4";
}

export function SignInButton({
    className,
    variant = "solid",
    size = "2",
}: SignInButtonProps) {
    const handleSignIn = async () => {
        const supabase = createClientComponentClient(supabaseOption);
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });
    };

    return (
        <Button
            onClick={handleSignIn}
            className={className}
            variant={variant}
            size={size}
        >
            Sign in with GitHub
        </Button>
    );
}
