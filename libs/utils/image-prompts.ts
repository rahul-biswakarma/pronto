import type { ImagePart } from "ai";
import { templates } from "../constants/templates";

export function getImageTemplatePrompt(templateId: string): ImagePart {
    const template =
        templates.find((template) => template.id === templateId) ??
        templates[0];

    return {
        type: "image",
        image: `${process.env.NEXT_PUBLIC_BASE_URL}/${template.image}`,
    };
}
