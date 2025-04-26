import type { Template } from "@/libs/constants/templates";
import { SkeletonRow } from "./skeleton-row";
import { TemplateCard } from "./template-card";

interface CategoryRowProps {
    title: string;
    templates: Template[];
    isLoading?: boolean;
    onTemplateClick?: (template: Template) => void;
}

export function CategoryRow({
    title,
    templates,
    isLoading,
    onTemplateClick,
}: CategoryRowProps) {
    return (
        <section className="flex flex-col w-full max-w-[85%] bg-[var(--feno-surface-0)] rounded-3xl py-[32px] gap-[16px] shadow-[var(--feno-minimal-shadow)]">
            <h2
                className="text-[25px] font-semibold px-[32px] text-[var(--color-text-1)]"
                style={{ fontFamily: "var(--font-sans)" }}
            >
                {title}
            </h2>

            <div className="flex gap-6 overflow-x-auto px-[32px] no-scrollbar">
                {isLoading ? (
                    <SkeletonRow count={4} />
                ) : templates.length === 0 ? (
                    <div className="text-[var(--color-text-3)] italic py-8 px-4">
                        No templates available.
                    </div>
                ) : (
                    templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onClick={() => onTemplateClick?.(template)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
