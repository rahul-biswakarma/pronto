"use client";

import { createSupabaseBrowserClient } from "@/libs/supabase/client/browser";
import { Button } from "@radix-ui/themes";

export function GoogleSignin() {
    const supabase = createSupabaseBrowserClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    const handleSignin = () => {
        supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });
    };

    return (
        <Button onClick={handleSignin} variant="soft">
            Sign in with Google
        </Button>
    );
}
