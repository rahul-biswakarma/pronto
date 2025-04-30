"use client";

import { WebsiteRenderer } from "./_components/website-renderer";
import { useRouteContext } from "./context/route.context";

export const Editor = () => {
    const { activeRouteHtml } = useRouteContext();
    return <WebsiteRenderer html={activeRouteHtml} />;
};
