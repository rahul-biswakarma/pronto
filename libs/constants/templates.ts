export type Template = {
    id: string;
    name: string;
    description: string;
    image: string;
    prompt: string;
    mimeType: string;
    metadata?: {
        isNew: boolean;
        isPopular: boolean;
        favicon: string;
    };
};

export const templates: Template[] = [
    {
        id: "feno:1",
        name: "NKTD",
        description: "Programmer & engineering student",
        image: "/templates/image-1.png",
        prompt: "Create a minimalist personal website with a dark background, centered content layout, elegant typography, and subtle interactions. Include sections for biography, current activities (Now page), a Colophon, a newsletter signup, and social media links. Showcase music activity and maintain a conversational tone throughout the site.",
        metadata: {
            isNew: true,
            isPopular: true,
            favicon: "https://paco.me/twitter-sm.png",
        },
        mimeType: "image/png",
    },
    {
        id: "feno:2",
        name: "Maggie",
        description: "Visual essays on tech",
        image: "/templates/image-2.png",
        prompt: "Create a personal website with a soft light background, elegant large typography, and a focus on visual essays about programming, design, and anthropology. Include a section called 'The Garden' for essays and notes, with simple card layouts and minimalistic side navigation. Maintain a warm and approachable tone.",
        mimeType: "image/png",
        metadata: {
            isNew: true,
            isPopular: true,
            favicon:
                "https://www.google.com/s2/favicons?sz=256&domain_url=https%3A%2F%2Fmaggieappleton.com%2F",
        },
    },
    {
        id: "feno:3",
        name: "Josh Comeau",
        description: "Fun tutorials and courses",
        image: "/templates/image-3.png",
        prompt: "Create a vibrant personal website with a dark background, playful 3D character, and colorful accent animations. Include sections for articles, tutorials, courses, and popular content lists. Use approachable language, clear navigation at the top, and category tags for easy browsing.",
        mimeType: "image/png",
        metadata: {
            isNew: true,
            isPopular: true,
            favicon:
                "https://www.google.com/s2/favicons?sz=256&domain_url=https%3A%2F%2Fjoshwcomeau.com%2F",
        },
    },
    {
        id: "feno:4",
        name: "Max Böck",
        description: "Building websites and writing",
        image: "/templates/image-4.png",
        prompt: "Create a modern personal website with a dark background, bold typography, and a focus on writing and web development. Include a strong introductory headline, a short biography, and a featured posts section displaying blog articles with thumbnail images. Use clean, simple navigation and emphasize clarity and structure.",
        mimeType: "image/png",
        metadata: {
            isNew: true,
            isPopular: true,
            favicon:
                "https://www.google.com/s2/favicons?sz=256&domain_url=https%3A%2F%2Fmxb.dev%2F",
        },
    },
    {
        id: "feno:5",
        name: "Paco Coursey",
        description: "Building polished web experiences",
        image: "/templates/image-5.png",
        prompt: "Create a minimalist portfolio website with a dark background, clean typography, and focus on writing, projects, and personal updates. Highlight sections for 'Building', 'Projects', 'Writing', and 'Now' updates. Keep the design simple, with subtle elegance and emphasis on clarity and performance.",
        mimeType: "image/png",
    },
    {
        id: "feno:6",
        name: "Piccalilli",
        description: "Front-end education platform",
        image: "/templates/image-6.webp",
        prompt: "Create a bold educational website with a light background, strong serif typography, and high contrast sections. Focus on front-end web development articles, premium courses, and newsletters. Highlight popular topics with tags and feature a vibrant promotional banner to guide users toward learning resources.",
        mimeType: "image/webp",
    },
    {
        id: "feno-article:1",
        name: "Paco.me",
        description:
            "A minimalist personal website with a dark background, centered content layout, elegant typography, and subtle interactions. Include sections for biography, current activities (Now page), a Colophon, a newsletter signup, and social media links. Showcase music activity and maintain a conversational tone throughout the site.",
        image: "/wireframes/article/image.png",
        prompt: "Write an engaging article template that follows a minimalist style with clear headings and concise paragraphs. Focus on delivering valuable insights while maintaining a conversational tone. Include relevant examples and practical takeaways. Structure the content with a compelling introduction, well-organized body sections, and a strong conclusion that ties everything together. Aim for clarity and readability while keeping the reader engaged throughout.",
        mimeType: "image/png",
    },
];
