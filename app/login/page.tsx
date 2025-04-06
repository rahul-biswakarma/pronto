import { GoogleSignin } from "@/components/auth/signin";

export default function Login() {
    return (
        <div className="flex flex-col justify-center items-center h-full p-4">
            <GoogleSignin />
        </div>
    );
}
