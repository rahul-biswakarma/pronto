import { useOnboarding } from "../onboarding.context";

export const TemplateFilters = () => {
    const { categories, selectedCategory, setSelectedCategory } =
        useOnboarding();

    return (
        <div className="w-full mb-6">
            <h2 className="text-xl font-medium mb-4">
                Start with the best PowerPoint templates
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
                {categories.map((cat) => {
                    return (
                        <div
                            key={cat.title}
                            className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${
                                selectedCategory === cat.value
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            {cat.title}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
