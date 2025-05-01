import { Logo } from "./logo";
import { UserCard } from "./user-card";

export const Navigation = () => {
    return (
        <div className="relative flex w-full items-center justify-center px-[5vw]">
            <header className="relative flex flex-1 w-full max-w-[900px] justify-between items-center rounded-2xl p-2 px-4 bg-[#E7E7E7]/50 border !border-[#E7E7E7]/40 text-black overflow-hidden">
                <div
                    className="absolute w-full h-full -ml-4 pointer-events-none select-none"
                    style={{
                        background: "url(/assets/noise.png)",
                        backgroundRepeat: "repeat",
                        backgroundSize: "50px",
                        backgroundPosition: "center",
                    }}
                />
                <span className="text-[18px] z-10 font-medium flex gap-2">
                    <Logo />
                    Feno
                </span>
                <UserCard />
            </header>
        </div>
    );
};
