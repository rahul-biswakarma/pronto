import { Logo } from "./logo";
import { Subscribe } from "./subscribe";

export const Footer = () => {
    return (
        <div className="w-full flex justify-center items-center">
            <div className="flex justify-between items-center w-full max-w-[900px] gap-[20px] flex-wrap p-6 py-10">
                <a
                    className="flex gap-2 hover:underline text-[20px] font-medium"
                    href="/"
                >
                    <Logo />
                    Feno
                </a>
                <Subscribe />
            </div>
        </div>
    );
};
