import { Onboarding } from "@/libs/components/onboarding/onboarding";
import { checkAuthentication } from "@/libs/utils/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const { userId, supabase, authenticated } = await checkAuthentication();

    if (authenticated) {
        const { data: summary } = await supabase
            .from("portfolio")
            .select("content")
            .eq("user_id", userId);

        const content = summary?.[0]?.content;

        if (content) {
            redirect("/editor");
        }
    }

    return <Onboarding />;
}
