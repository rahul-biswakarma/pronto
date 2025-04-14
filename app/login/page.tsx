import { GoogleSignin } from "@/libs/components/auth/signin";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <GoogleSignin />
        </div>
    );
}
