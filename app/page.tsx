import { DataProvider } from "@/components/context/data.context";
import { Uploader } from "@/components/generator/uploader";
import { PortfolioPreview } from "@/components/portfolio-preview";
import { checkAuthentication } from "@/utils/auth";
import { Flex, Heading, Text } from "@radix-ui/themes";

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

    const { data: summary, error } = await supabase
        .from("resume_summaries")
        .select("*")
        .eq("user_id", userId)
        .single();

    return (
        <DataProvider htmlUrl={summary?.portfolio_url}>
            <Flex
                direction="column"
                align="center"
                justify="center"
                gap="6"
                style={{ minHeight: "90vh", padding: "24px" }}
            >
                <Heading size="6" align="center">
                    Resume to Portfolio Generator
                </Heading>
                {summary?.portfolio_url ? <PortfolioPreview /> : <Uploader />}
            </Flex>
        </DataProvider>
    );
}
