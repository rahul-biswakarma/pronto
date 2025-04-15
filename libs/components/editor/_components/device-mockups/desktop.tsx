"use client";

interface DesktopProps {
    children: React.ReactNode;
}

export const Desktop = ({ children }: DesktopProps) => {
    return (
        <div
            className="grid grid-rows-[auto_1fr] relative min-w-[1100px] min-h-[700px] rounded-lg border border-black/10 overflow-hidden p-1.5 pt-0"
            style={{
                background:
                    "linear-gradient(90deg,rgba(228, 228, 241, 0.5) 0%, rgba(240, 240, 229, 0.5) 100%)",
            }}
        >
            <div className="flex justify-center items-center relative px-4 py-1.5 backdrop-blur-md">
                <div className="text-sm text-gray-600 z-10 rounded-[8px] bg-black/10 px-2 py-1 min-w-[250px] backdrop-blur-sm flex justify-center items-center">
                    feno.app
                </div>
            </div>

            <div className="w-full h-full rounded-sm border border-black/10 overflow-hidden">
                <div className="w-full h-full">{children}</div>
            </div>
        </div>
    );
};
