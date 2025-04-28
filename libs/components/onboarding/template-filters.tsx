import { useOnboarding } from "./onboarding.context";

export const TemplateFilters = () => {
    const { categories, selectedCategory, setSelectedCategory } =
        useOnboarding();

    return (
        <div className="flex gap-x-2 items-center">
            <div className="text-4xl font-italianno mr-4">Filters:</div>
            {categories.map((cat) => {
                return (
                    <div
                        key={cat.title}
                        className={`text-md px-3 py-2 rounded-full cursor-pointer transition-colors duration-300 ease-out border ${
                            selectedCategory === cat.value
                                ? "bg-[var(--feno-surface-1-foreground)] text-[var(--feno-surface-1)]"
                                : "bg-[var(--feno-surface-1)] text-[var(--feno-surface-1-foreground)]"
                        }`}
                        onClick={() => setSelectedCategory(cat.value)}
                    >
                        {cat.title}
                    </div>
                );
            })}
        </div>
    );
};
