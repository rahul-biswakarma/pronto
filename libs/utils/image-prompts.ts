import type { ImagePart } from "ai";

const design1 = {
    url: `${process.env.NEXT_PUBLIC_HOST}/ss/design-1.png`,
};

export function getImageTemplatePrompt(): ImagePart {
    return {
        type: "image",
        image: design1.url,
    };
}
