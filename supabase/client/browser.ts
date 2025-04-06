import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseBrowserClient = ({
    supabaseUrl,
    supabaseAnonKey,
}: {
    supabaseUrl: string | undefined;
    supabaseAnonKey: string | undefined;
}) => createBrowserClient(supabaseUrl!, supabaseAnonKey!);
