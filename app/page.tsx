import { DataProvider } from "@/components/context/data.context";
import { App } from "@/components/main";
import { checkAuthentication } from "@/utils/auth";
import { Flex, Text } from "@radix-ui/themes";

export default async function Home() {
    const { userId, supabase } = await checkAuthentication();

    if (!supabase) {
        return (
            <Flex
                align="center"
                justify="center"
                direction="column"
                gap="4"
                style={{ height: "100vh" }}
            >
                <Text size="5" color="red">
                    Authentication Error
                </Text>
                <Text>Please try logging in again</Text>
            </Flex>
        );
    }

    const { data: summary } = await supabase
        .from("resume_summaries")
        .select("*")
        .eq("user_id", userId)
        .single();

    return (
        <DataProvider htmlUrl={summary?.portfolio_url}>
            <App />
        </DataProvider>
    );
}
