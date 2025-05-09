import { Button } from "@/libs/ui/button";
import { createSupabaseBrowserClient } from "@/supabase/utils/client/browser";
import { supabaseOption } from "@/supabase/utils/config";
import { IconLogout } from "@tabler/icons-react";
import { redirect } from "next/navigation";

export const SignOut = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const supabase = createSupabaseBrowserClient(supabaseOption);

    return (
        <Button
            className={className}
            size={children ? "default" : "icon"}
            onClick={async () => {
                await supabase.auth.signOut().then(() => {
                    redirect("/");
                });
            }}
        >
            {children ?? <IconLogout size={20} />}
        </Button>
    );
};
