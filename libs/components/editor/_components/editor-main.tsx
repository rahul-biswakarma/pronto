"use client";

import { EditorInput } from "./editor-input";

const MockContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="bg-accent w-full h-full max-h-full rounded-lg p-0.5 relative">
            <div className="bg-background rounded-sm h-full">
                <div className="w-full h-12 flex items-center justify-center border-b border-secondary relative cursor-pointer">
                    <div className="w-80 h-7 flex items-center relative">
                        <div
                            className="text-xs w-full text-center py-1 text-stone-500 
                            bg-accent text-text-secondary rounded-lg 
                            select-none cursor-pointer hover:opacity-80 
                            transition-opacity duration-150 mix-blend-multiply dark:mix-blend-screen "
                            style={{ opacity: 1, transform: "none" }}
                        >
                            <span>self.so/nikhil</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                className="w-4 h-4 absolute right-1.5 top-1/2 -translate-y-1/2"
                            >
                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>{children}</div>
            </div>

            <EditorInput />
        </div>
    );
};

export const EditorMain = () => {
    return (
        <div className="p-2 flex w-full h-full">
            <MockContainer>Hello</MockContainer>
        </div>
    );
};
