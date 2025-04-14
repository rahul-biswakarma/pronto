import { Onboarding } from "@/libs/components/onboarding/onboarding";
import { checkAuthentication } from "@/libs/utils/auth";

export default async function Home() {
    const { authenticated } = await checkAuthentication();

    return <Onboarding authenticated={authenticated} />;
}
