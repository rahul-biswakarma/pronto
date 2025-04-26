import { type Template, templates } from "@/libs/constants/templates";
import { useEffect, useState } from "react";

export function useTemplateData() {
    // TODO: Replace with real API if needed
    const [data, setData] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setData(templates);
            setIsLoading(false);
        }, 800); // Simulate loading
    }, []);

    return { data, isLoading };
}
