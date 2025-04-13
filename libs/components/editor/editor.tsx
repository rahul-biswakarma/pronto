import type { Database } from "@/libs/supabase/database.types";
import { redirect } from "next/navigation";
import { EditorMain } from "./_components/editor-main";
import { havePortfolioContent, shouldGenerateSomething } from "./_utils/checks";
import { useEditorContext } from "./editor.context";
const EditorWrapper = ({
    portfolio,
}: { portfolio: Database["public"]["Tables"]["portfolio"]["Row"] }) => {
    const { setStage } = useEditorContext();

    if (!havePortfolioContent(portfolio)) {
        redirect("/");
    }

    const { html, contentJson } = shouldGenerateSomething(portfolio);

    if (!html || !contentJson) {
        setStage("generating_content");
    }

    return <EditorMain />;
};

export { EditorWrapper as Editor };
