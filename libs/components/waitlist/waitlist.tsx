"use client";

import type React from "react";
import { useRef, useState } from "react";

const ButtonContent = ({ subsrcibbed }: { subsrcibbed: boolean }) => {
    return subsrcibbed ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            stroke-linejoin="round"
            className="mx-auto my-auto h-4 w-4 text-primary"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.5607 3.99999L15.0303 4.53032L6.23744 13.3232C5.55403 14.0066 4.44599 14.0066 3.76257 13.3232L4.2929 12.7929L3.76257 13.3232L0.969676 10.5303L0.439346 9.99999L1.50001 8.93933L2.03034 9.46966L4.82323 12.2626C4.92086 12.3602 5.07915 12.3602 5.17678 12.2626L13.9697 3.46966L14.5 2.93933L15.5607 3.99999Z"
                fill="currentColor"
            />
        </svg>
    ) : (
        "Join Waitlist"
    );
};

export const NewsLetter = () => {
    const [subsrcibbed, setSubscribbed] = useState(false);
    const [pending, setPending] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = emailRef.current?.value;
        setPending(true);

        const response = await fetch("/api/waitlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            emailRef.current!.value = "";
            setSubscribbed(true);
        }

        setPending(false);
        setTimeout(() => {
            setSubscribbed(false);
        }, 4000);
        return response;
    };

    return (
        <div className="text-[16px] flex flex-col gap-2">
            <form
                className="flex h-10 items-center justify-between gap-2 overflow-hidden rounded-sm bg-accent shadow-border
           focus-within:border-gray-800 focus-within:outline-none focus-within:ring-2
           focus-within:ring-black/20 focus-within:ring-offset-0"
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                <label htmlFor="email" className="sr-only">
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    ref={emailRef}
                    className="h-full w-full grow border-none bg-transparent px-3.5 transition-colors placeholder:text-reg-16 focus:outline-none"
                    placeholder="Enter your email"
                    required
                />

                <button
                    type="submit"
                    className="mr-1 h-[30px] w-[150px]
                    rounded-[4px] bg-background
                    dark:text-primary px-1.5 text-sm font-medium outline-none
                    focus:outline-tertiary md:px-3.5"
                >
                    <span className="flex font-extralight items-center justify-center">
                        {pending ? (
                            <svg
                                aria-hidden="true"
                                className="w-4 h-4 text-primary animate-spin fill-white dark:fill-black"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                        ) : (
                            <ButtonContent subsrcibbed={subsrcibbed} />
                        )}
                    </span>
                </button>
            </form>
        </div>
    );
};
