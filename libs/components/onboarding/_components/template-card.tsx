import type { Template } from "@/libs/constants/templates";
import Image from "next/image";

interface TemplateCardProps {
    template: Template;
    onClick?: () => void;
    onDropPdf?: (file: File) => void; // Optional advanced UX
}

export function TemplateCard({
    template,
    onClick,
    onDropPdf,
}: TemplateCardProps) {
    return (
        <div className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:translate-y-[-4px]">
            <div className="relative overflow-hidden rounded-xl aspect-video bg-surface-1 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300">
                {/* New badge */}
                {template.metadata?.isNew && (
                    <div className="absolute top-3 left-3 z-10 bg-black text-white text-xs font-medium px-2 py-1 rounded-full">
                        New
                    </div>
                )}

                {/* Template image with overlay */}
                <div className="relative w-full h-full overflow-hidden">
                    <Image
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        src={template.image}
                        width={1080}
                        height={720}
                        alt={template.name}
                    />

                    {/* Hover overlay with info */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <h3 className="text-white font-medium text-lg mb-1">
                            {template.name}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-2">
                            {template.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Template name below card */}
            <div className="mt-3 px-1">
                <h3 className="font-medium text-[var(--feno-text-1)]">
                    {template.name}
                </h3>
            </div>
        </div>
    );
}
