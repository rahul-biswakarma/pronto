import type { Template } from "@/libs/constants/templates";
import { Button } from "@/libs/ui/button";
import Image from "next/image";

interface TemplateCardProps {
    template: Template;
    onClick?: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
    return (
        <div className="flex flex-col gap-4 w-full group relative">
            <div
                className="relative overflow-hidden rounded-3xl aspect-square bg-surface-1 transition-all duration-300 ease-out flex items-center justify-center p-4 sm:p-6 md:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:scale-[1.02]"
                role={onClick ? "button" : undefined}
            >
                {template.metadata?.isNew && (
                    <div className="absolute top-4 left-4 text-xs text-feno-text-3 px-2 py-1 rounded-lg bg-surface-2 z-20">
                        New
                    </div>
                )}
                <div className="absolute inset-0 bg-feno-surface-0/50 backdrop-blur-sm -z-10" />
                <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                        className="object-cover object-top aspect-video rounded-xl border w-full h-auto max-w-full max-h-full"
                        src={template.image}
                        width={1080}
                        height={1080}
                        alt={template.name}
                    />
                </div>

                {/* Animated Select Button */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[200%] group-hover:translate-y-0 transition-transform duration-300 ease-out mb-8 z-20"
                    onClick={onClick}
                >
                    <Button className="bg-blue-700 rounded-xl">
                        Select Template
                    </Button>
                </div>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181c]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-10" />
            </div>
        </div>
    );
}
