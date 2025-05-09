import { GoogleSignin } from "@/libs/components/auth/signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In | Feno — Your Story, Beautifully Told",
    description:
        "Access your Feno account to manage and create stunning digital portfolios from your resume.",
};

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <GoogleSignin />
        </div>
    );
}
