import type { ImagePart } from "ai";
import { templates } from "../constants/templates";

export function getImageTemplatePrompt(templateId: string): ImagePart {
    return {
        type: "image",
        image:
            templates.find((template) => template.id === templateId)?.image ??
            templates[0].image,
    };
}
