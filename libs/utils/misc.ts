import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Template, templates } from "../constants/templates";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const TEMPLATE_ID_KEY = "template-id";

export function setTemplateInLocalStorage(templateId: string) {
    localStorage.setItem(TEMPLATE_ID_KEY, templateId);
}

export function getTemplateFromLocalStorage(): Template {
    const templateId = localStorage.getItem(TEMPLATE_ID_KEY);
    if (!templateId) {
        return templates[0];
    }
    const template = templates.find((template) => template.id === templateId);
    if (!template) {
        return templates[0];
    }
    return template;
}

export const createDomainRouteMap = async (
    routes: {
        path: string;
        html_file_path: string;
        id: string;
    }[],
): Promise<{
    [key: string]: string;
}> => {
    return routes.reduce(
        (acc, route) => {
            acc[route.path === "/" ? "/" : `${route.path}`] =
                route.html_file_path;
            return acc;
        },
        {} as { [key: string]: string },
    );
};
