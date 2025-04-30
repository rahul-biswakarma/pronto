import { Button } from "@/libs/ui/button";

export const Navigation = () => {
    return (
        <div className="relative flex w-full items-center justify-center px-[5vw]">
            <header className="relative flex flex-1 w-full max-w-[900px] justify-between items-center rounded-2xl p-2 px-4 bg-[#E7E7E7]/50 border !border-[#E7E7E7]/40 text-black overflow-hidden">
                <div
                    className="absolute w-full h-full -ml-4"
                    style={{
                        background: "url(/noise.png)",
                        backgroundRepeat: "repeat",
                        backgroundSize: "50px",
                        backgroundPosition: "center",
                    }}
                />
                <span className="text-[18px] z-10 font-medium flex gap-2">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clipPath="url(#clip0_8166_2070)">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M23.0194 0.75C23.0194 0.335786 22.6836 0 22.2694 0H17.7117C17.2975 0 16.9617 0.335787 16.9617 0.75V10.9423C16.9617 11.3565 16.6259 11.6923 16.2117 11.6923H12.8658C12.4516 11.6923 12.1158 11.3565 12.1158 10.9423V6.90381C12.1158 6.48959 11.78 6.15381 11.3658 6.15381H6.80811C6.39389 6.15381 6.05811 6.4896 6.05811 6.90381V10.9423C6.05811 11.3565 5.72232 11.6923 5.30811 11.6923H1.35596C0.941744 11.6923 0.605957 12.0281 0.605957 12.4423V23.25C0.605957 23.6642 0.941743 24 1.35596 24H5.91365C6.32786 24 6.66365 23.6642 6.66365 23.25V13.0577C6.66365 12.6434 6.99944 12.3077 7.41365 12.3077H10.7599C11.1741 12.3077 11.5099 12.6434 11.5099 13.0577V17.0961C11.5099 17.5104 11.8457 17.8461 12.2599 17.8461H16.8176C17.2318 17.8461 17.5676 17.5104 17.5676 17.0961V13.0577C17.5676 12.6435 17.9034 12.3077 18.3176 12.3077H22.2694C22.6836 12.3077 23.0194 11.9719 23.0194 11.5577V0.75Z"
                                fill="black"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_8166_2070">
                                <rect width="24" height="24" fill="black" />
                            </clipPath>
                        </defs>
                    </svg>
                    Feno
                </span>
                <Button variant="custom" className="bg-white z-10 text-black">
                    Login
                </Button>
            </header>
        </div>
    );
};
