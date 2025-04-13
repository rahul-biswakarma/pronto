import { Editor } from "@/libs/components/editor/editor";
import { EditorProvider } from "@/libs/components/editor/editor.context";
import { checkAuthentication } from "@/libs/utils/auth";
import { redirect } from "next/navigation";

export default async function Page() {
    const { authenticated, errorResponse, supabase, userId } =
        await checkAuthentication();

    if (!authenticated || errorResponse) {
        redirect("/");
    }

    const { data: portfolio, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", userId);

    if (
        error ||
        !portfolio ||
        portfolio.length === 0
        // if content is null, it means the user has not submitted their portfolio yet
    ) {
        redirect("/");
    }

    // TODO: Add portfolio selector in case the user has multiple portfolios

    // const contentJson = await getFileFromBucket(portfolio[0].content_s3_path);
    // const html = await getFileFromBucket(portfolio[0].html_s3_path);

    return (
        <EditorProvider>
            <Editor portfolio={portfolio[0]} />
        </EditorProvider>
    );
}
