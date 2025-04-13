import type { Database } from "@/libs/supabase/database.types";

export const haveContentJson = (
    response: Database["public"]["Tables"]["portfolio"]["Row"],
) => {
    return response.content_s3_path;
};

export const havePortfolioHtml = (
    response: Database["public"]["Tables"]["portfolio"]["Row"],
) => {
    return response.hosted_html_url;
};

export const havePortfolioContent = (
    response: Database["public"]["Tables"]["portfolio"]["Row"],
) => {
    return response.content;
};

export const shouldGenerateSomething = (
    response: Database["public"]["Tables"]["portfolio"]["Row"],
) => {
    return {
        html: !havePortfolioHtml(response),
        contentJson: !haveContentJson(response),
    };
};
