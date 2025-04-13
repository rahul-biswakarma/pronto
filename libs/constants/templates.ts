export type Template = {
    id: string;
    name: string;
    description: string;
    image: string;
    prompt: string;
};

export const templates: Template[] = [
    {
        id: "pronto:1",
        name: "NKTD",
        description: "Programmer & engineering student",
        image: "/templates/image-1.png",
        prompt: "Create a minimalist personal website with a dark background, centered content layout, elegant typography, and subtle interactions. Include sections for biography, current activities (Now page), a Colophon, a newsletter signup, and social media links. Showcase music activity and maintain a conversational tone throughout the site.",
    },
    {
        id: "pronto:2",
        name: "Maggie",
        description: "Visual essays on tech",
        image: "/templates/image-2.png",
        prompt: "Create a personal website with a soft light background, elegant large typography, and a focus on visual essays about programming, design, and anthropology. Include a section called 'The Garden' for essays and notes, with simple card layouts and minimalistic side navigation. Maintain a warm and approachable tone.",
    },
    {
        id: "pronto:3",
        name: "Josh Comeau",
        description: "Fun tutorials and courses",
        image: "/templates/image-3.png",
        prompt: "Create a vibrant personal website with a dark background, playful 3D character, and colorful accent animations. Include sections for articles, tutorials, courses, and popular content lists. Use approachable language, clear navigation at the top, and category tags for easy browsing.",
    },
    {
        id: "pronto:4",
        name: "Max Böck",
        description: "Building websites and writing",
        image: "/templates/image-4.png",
        prompt: "Create a modern personal website with a dark background, bold typography, and a focus on writing and web development. Include a strong introductory headline, a short biography, and a featured posts section displaying blog articles with thumbnail images. Use clean, simple navigation and emphasize clarity and structure.",
    },
    {
        id: "pronto:5",
        name: "Paco Coursey",
        description: "Building polished web experiences",
        image: "/templates/image-5.png",
        prompt: "Create a minimalist portfolio website with a dark background, clean typography, and focus on writing, projects, and personal updates. Highlight sections for 'Building', 'Projects', 'Writing', and 'Now' updates. Keep the design simple, with subtle elegance and emphasis on clarity and performance.",
    },
    {
        id: "pronto:6",
        name: "Piccalilli",
        description: "Front-end education platform",
        image: "/templates/image-6.png",
        prompt: "Create a bold educational website with a light background, strong serif typography, and high contrast sections. Focus on front-end web development articles, premium courses, and newsletters. Highlight popular topics with tags and feature a vibrant promotional banner to guide users toward learning resources.",
    },
];
