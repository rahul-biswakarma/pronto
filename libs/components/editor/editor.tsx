"use client";

import type { Database } from "@/libs/supabase/database.types";
import { redirect } from "next/navigation";
import { EditorMain } from "./_components/editor-main";
import { havePortfolioContent, havePortfolioHtml } from "./_utils/checks";

const EditorWrapper = ({
    portfolio,
}: { portfolio: Database["public"]["Tables"]["portfolio"]["Row"] }) => {
    if (!havePortfolioContent(portfolio) || !havePortfolioHtml(portfolio)) {
        redirect("/");
    }

    return <EditorMain />;
};

export { EditorWrapper as Editor };
