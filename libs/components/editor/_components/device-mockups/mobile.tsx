"use client";

interface MobileProps {
    children: React.ReactNode;
}

export const Mobile = ({ children }: MobileProps) => {
    return (
        <div
            className="relative w-[375px] h-[812px] rounded-[40px] border border-black/10 overflow-hidden p-4 shadow-md"
            style={{
                background:
                    "linear-gradient(90deg,rgba(228, 228, 241, 0.5) 0%, rgba(240, 240, 229, 0.5) 100%)",
            }}
        >
            {/* Content area */}
            <div className="w-full h-full rounded-[30px] border border-black/10 overflow-hidden">
                <div className="w-full h-full overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};
