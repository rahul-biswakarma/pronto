"use client";

import type { Database } from "@/libs/supabase/database.types";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { EditorMain } from "./_components/editor-main";
import { havePortfolioContent, shouldGenerateSomething } from "./_utils/checks";
import { useEditorContext } from "./editor.context";

const EditorWrapper = ({
    portfolio,
}: { portfolio: Database["public"]["Tables"]["portfolio"]["Row"] }) => {
    const {
        setStage,
        generatePortfolioContent,
        generatePortfolioHtml,
        isLoading,
        error,
    } = useEditorContext();
    const [isInitializing, setIsInitializing] = useState(true);

    if (!havePortfolioContent(portfolio)) {
        redirect("/");
    }

    const { html, contentJson } = shouldGenerateSomething(portfolio);

    useEffect(() => {
        const initializePortfolio = async () => {
            if (!html || !contentJson) {
                try {
                    // Generate content if needed
                    if (!contentJson) {
                        await generatePortfolioContent(portfolio.id);
                    }

                    // Generate HTML if needed (only after content is generated)
                    if (!html) {
                        await generatePortfolioHtml(portfolio.id);
                    }

                    setStage("idle");
                } catch (err) {
                    console.error("Failed to initialize portfolio:", err);
                } finally {
                    setIsInitializing(false);
                }
            } else {
                setIsInitializing(false);
            }
        };

        initializePortfolio();
    }, [
        portfolio.id,
        html,
        contentJson,
        generatePortfolioContent,
        generatePortfolioHtml,
        setStage,
    ]);

    if (isInitializing || isLoading) {
        return <div>Loading your portfolio...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <EditorMain />;
};

export { EditorWrapper as Editor };
