"use client";

import { Button } from "@/libs/ui/button";
import { createSupabaseBrowserClient } from "@/supabase/utils/client/browser";

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

    return <Button onClick={handleSignin}>Sign in with Google</Button>;
}
