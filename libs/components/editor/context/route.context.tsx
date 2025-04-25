"use client";

import { getFileFromBucket } from "@/libs/utils/supabase-storage";
import {
    type Dispatch,
    type SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type RouteContextType = {
    domain: string;
    portfolioId: string;

    activeRoute: string;
    setActiveRoute: Dispatch<SetStateAction<string>>;

    routeMap: Record<string, string>;
    setRouteMap: Dispatch<SetStateAction<Record<string, string>>>;

    activeRouteHtml: string;
    activeRouteHtmlPath: string;
    setActiveRouteHtmlPath: Dispatch<SetStateAction<string>>;
};

export const RouteContext = createContext<RouteContextType>({
    domain: "",
    portfolioId: "",

    activeRoute: "",
    setActiveRoute: () => {},

    routeMap: {},
    setRouteMap: () => {},

    activeRouteHtml: "",
    activeRouteHtmlPath: "",
    setActiveRouteHtmlPath: () => {},
});

type RouteProviderProps = {
    domain: string;
    portfolioId: string;
    routeMap: Record<string, string>;
    children: React.ReactNode;
};

export const RouteProvider = ({
    children,
    domain,
    portfolioId,
    ...props
}: RouteProviderProps) => {
    const [routeMap, setRouteMap] = useState(props.routeMap);
    const [activeRoute, setActiveRoute] = useState("/");
    const [activeRouteHtml, setActiveRouteHtml] = useState("");
    const [activeRouteHtmlPath, setActiveRouteHtmlPath] = useState("");

    useEffect(() => {
        const htmlPath = routeMap[activeRoute];
        console.log("htmlPath", htmlPath, routeMap);

        const getHtml = async () => {
            const html = await getFileFromBucket(htmlPath);
            setActiveRouteHtml(html.data ?? "");
        };

        getHtml();

        setActiveRouteHtmlPath(htmlPath);
    }, [activeRoute, routeMap]);

    return (
        <RouteContext.Provider
            value={{
                domain,
                portfolioId,

                activeRoute,
                setActiveRoute,

                routeMap,
                setRouteMap,

                activeRouteHtml,
                activeRouteHtmlPath,
                setActiveRouteHtmlPath,
            }}
        >
            {children}
        </RouteContext.Provider>
    );
};

export const useRouteContext = () => {
    return useContext(RouteContext);
};
