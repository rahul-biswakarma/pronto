import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (req.method === "POST") {
        try {
            const formBody = `email=${encodeURIComponent(body.email)}`;

            await fetch("https://app.loops.so/api/v1/contacts/create", {
                method: "POST",
                body: formBody,
                headers: {
                    Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            return new NextResponse(
                JSON.stringify({
                    status: "success",
                    data: { email: body.email },
                }),
                {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                },
            );
        } catch (error) {
            return new NextResponse(
                JSON.stringify({
                    status: "error",
                    message: error,
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    }
}
