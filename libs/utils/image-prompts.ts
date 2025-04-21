import { templates } from "../constants/templates";

export function getImageTemplateUrl(templateId: string): string {
    const template =
        templates.find((template) => template.id === templateId) ??
        templates[0];

    return `${process.env.NEXT_PUBLIC_BASE_URL}/${template.image}`;
}

export function getImageMimeType(templateId: string): string {
    const template =
        templates.find((template) => template.id === templateId) ??
        templates[0];

    return template.mimeType;
}
