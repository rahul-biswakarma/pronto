import { checkAuthentication } from "@/libs/utils/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const auth = await checkAuthentication();

    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = auth.supabase;
    const userId = auth.userId;

    try {
        const { data, error } = await supabase
            .from("portfolio_assets")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ assets: data, success: true });
    } catch (error) {
        console.error("Failed to fetch assets:", error);
        return NextResponse.json(
            { error: "Failed to fetch assets", success: false },
            { status: 500 },
        );
    }
}
