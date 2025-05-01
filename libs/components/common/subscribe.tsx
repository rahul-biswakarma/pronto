import { Button } from "@/libs/ui/button";
import dataLayer from "@/libs/utils/data-layer";
import { IconMail } from "@tabler/icons-react";
import { useState } from "react";

export const Subscribe = () => {
    const [email, setEmail] = useState("");

    const handleSubscribe = async () => {
        await dataLayer.post("/api/subscribe", {
            email,
        });
    };

    return (
        <div className="flex items-center bg-[var(--feno-surface-1)] p-1 rounded-xl border border-[var(--feno-border-1)]">
            <IconMail className="text-[var(--feno-text-2)] ml-1.5" />
            <input
                value={email}
                onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                    setEmail(e.currentTarget.value)
                }
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Your email address"
                className="ml-2"
            />
            <Button onClick={handleSubscribe} size="sm">
                Subscribe
            </Button>
        </div>
    );
};
