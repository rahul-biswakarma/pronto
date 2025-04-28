import type { z } from "zod";
import { contactFormBlockInfo } from "./blocks/contact-form";
import { newsletterBlockInfo } from "./blocks/newsletter";
import { testimonialCarouselBlockInfo } from "./blocks/testimonial-carousel";

// Define the block info type
export type BlockInfo = {
    id: string;
    name: string;
    description: string;
    icon: string;
    tags: string[];
    generateHTML: (config: unknown) => string;
    defaultConfig: unknown;
    configSchema: z.ZodType<unknown>;
};

// Registry for all available blocks
const blockRegistry: Record<string, BlockInfo> = {
    [newsletterBlockInfo.id]: newsletterBlockInfo,
    [contactFormBlockInfo.id]: contactFormBlockInfo,
    [testimonialCarouselBlockInfo.id]: testimonialCarouselBlockInfo,
};

// Function to get all available blocks
export const getAllBlocks = (): BlockInfo[] => {
    return Object.values(blockRegistry);
};

// Function to get a specific block by ID
export const getBlockById = (id: string): BlockInfo | undefined => {
    return blockRegistry[id];
};

// Function to filter blocks by tag
export const getBlocksByTag = (tag: string): BlockInfo[] => {
    return Object.values(blockRegistry).filter((block) =>
        block.tags.includes(tag),
    );
};

// Function to search blocks by name or description
export const searchBlocks = (query: string): BlockInfo[] => {
    const lowerQuery = query.toLowerCase();
    return Object.values(blockRegistry).filter(
        (block) =>
            block.name.toLowerCase().includes(lowerQuery) ||
            block.description.toLowerCase().includes(lowerQuery) ||
            block.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
};

// Function to generate block HTML from a block ID and config
export const generateBlockHTML = (blockId: string, config: unknown): string => {
    const block = getBlockById(blockId);
    if (!block) {
        throw new Error(`Block with ID "${blockId}" not found`);
    }
    return block.generateHTML(config);
};
