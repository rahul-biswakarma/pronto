import { SignInButton } from "@/components/features/auth/sign-in-button";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";

export default function LoginPage() {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ height: "100vh" }}
        >
            <Card size="3" style={{ maxWidth: "400px", width: "100%" }}>
                <Flex direction="column" align="center" gap="4" p="4">
                    <Heading size="5">Welcome to Pronto</Heading>
                    <Text size="2" mb="4" align="center">
                        Sign in to create and manage your portfolios
                    </Text>
                    <SignInButton size="3" />
                </Flex>
            </Card>
        </Flex>
    );
}
