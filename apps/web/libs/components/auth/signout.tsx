import { createSupabaseBrowserClient } from "@/libs/supabase/client/browser";
import { supabaseOption } from "@/libs/supabase/config";
import { Button } from "@/libs/ui/button";
import { IconLogout } from "@tabler/icons-react";
import { redirect } from "next/navigation";

export const SignOut = () => {
    const supabase = createSupabaseBrowserClient(supabaseOption);

    return (
        <Button
            size="icon"
            onClick={async () => {
                await supabase.auth.signOut().then(() => {
                    redirect("/");
                });
            }}
        >
            <IconLogout size={20} />
        </Button>
    );
};
