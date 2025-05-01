"use client";

import { usePDFJS } from "@/libs/hooks/use-pdf";
import { Button } from "@/libs/ui/button";
import { IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useOnboarding } from "../onboarding.context";

interface PdfDropzoneProps {
    onPdfUpload: (file: File | null) => void;
    disabled?: boolean;
    error?: string;
}

export function PdfDropzone({
    onPdfUpload,
    disabled,
    error,
}: PdfDropzoneProps) {
    const { extractTextFromPDF } = usePDFJS();
    const { setPdfContent } = useOnboarding();
    const [dragActive, setDragActive] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            onPdfUpload(file);
            setPdfContent(await extractTextFromPDF(file));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            onPdfUpload(file);
            setPdfContent(await extractTextFromPDF(file));
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPdfFile(null);
        onPdfUpload(null);
        setPdfContent("");
    };

    return (
        <div className="w-full p-1.5 bg-surface-1 rounded-2xl">
            <div
                className="p-1.5 rounded-2xl"
                style={{
                    background:
                        "linear-gradient(32deg,rgba(84, 100, 229, 1) 0%, rgba(246, 195, 122, 1) 32%, rgba(235, 149, 184, 1) 54%, rgba(226, 226, 226, 1) 75%)",
                }}
            >
                <div
                    className={`${dragActive ? "border-primary-500 bg-primary-50" : "border-black/10 bg-surface-1"} relative flex flex-col items-center justify-center rounded-xl p-6 transition-colors select-none ${disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                    aria-label="Upload PDF"
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                    {pdfFile ? (
                        <div className="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="48"
                                fill="none"
                            >
                                <rect
                                    width="40"
                                    height="48"
                                    fill="#FDFDFD"
                                    rx="8"
                                />
                                <path
                                    fill="url(#a)"
                                    fillOpacity=".25"
                                    d="M8 14.226A4.226 4.226 0 0 1 12.226 10h10.476c1.111 0 2.178.438 2.97 1.22l2.51 2.478 2.532 2.453A4.226 4.226 0 0 1 32 19.186v14.587A4.226 4.226 0 0 1 27.774 38H12.226A4.226 4.226 0 0 1 8 33.774V14.226Z"
                                />
                                <path
                                    stroke="#A8A8A8"
                                    strokeOpacity=".1"
                                    strokeWidth="1.5"
                                    d="M12.227 10.75H22.7c.857 0 1.683.317 2.319.886l.125.117 2.51 2.478.005.006 2.532 2.452a3.476 3.476 0 0 1 1.058 2.497v14.587a3.477 3.477 0 0 1-3.477 3.477H12.227a3.477 3.477 0 0 1-3.477-3.477V14.227a3.477 3.477 0 0 1 3.477-3.477Z"
                                />
                                <path
                                    fill="#E2E2E2"
                                    d="M30.683 18h-5.592A1.09 1.09 0 0 1 24 16.91v-5.593c0-.486.587-.73.931-.386l6.138 6.138c.344.344.1.931-.386.931Z"
                                />
                                <rect
                                    width="8.727"
                                    height="2.182"
                                    x="13"
                                    y="19"
                                    fill="#1B1B1B"
                                    opacity=".15"
                                    rx="1"
                                />
                                <rect
                                    width="13.091"
                                    height="2.182"
                                    x="13"
                                    y="23.364"
                                    fill="#727272"
                                    opacity=".1"
                                    rx="1"
                                />
                                <rect
                                    width="13.091"
                                    height="2.182"
                                    x="13"
                                    y="27.727"
                                    fill="#727272"
                                    opacity=".1"
                                    rx="1"
                                />
                                <defs>
                                    <linearGradient
                                        id="a"
                                        x1="20"
                                        x2="20"
                                        y1="2.94"
                                        y2="42.947"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stop-color="#EBEBEB" />
                                        <stop offset="1" stopColor="#C4C4C4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="font-medium font-mono text-black/70 truncate">
                                {pdfFile.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemove}
                                aria-label="Remove PDF"
                                type="button"
                            >
                                <IconX className="w-4 h-4" strokeWidth="2" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="50"
                                height="59"
                                fill="none"
                            >
                                <path
                                    fill="url(#a)"
                                    fillOpacity=".25"
                                    d="M0 8a8 8 0 0 1 8-8h18.775a8 8 0 0 1 5.711 2.398L37 7l4.657 4.657A8 8 0 0 1 44 17.314V45a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8Z"
                                />
                                <path
                                    stroke="#A8A8A8"
                                    strokeOpacity=".1"
                                    strokeWidth="1.5"
                                    d="M8 .75h18.774a7.25 7.25 0 0 1 5.176 2.173l4.515 4.602 4.662 4.662a7.25 7.25 0 0 1 2.123 5.127V45A7.25 7.25 0 0 1 36 52.25H8A7.25 7.25 0 0 1 .75 45V8l.01-.373A7.25 7.25 0 0 1 8 .75Z"
                                />
                                <path
                                    fill="#E2E2E2"
                                    d="M41.586 14H32a2 2 0 0 1-2-2V2.414c0-.89 1.077-1.337 1.707-.707l10.586 10.586c.63.63.184 1.707-.707 1.707Z"
                                />
                                <rect
                                    width="16"
                                    height="4"
                                    x="9"
                                    y="17"
                                    fill="#1B1B1B"
                                    opacity=".15"
                                    rx="2"
                                />
                                <rect
                                    width="24"
                                    height="4"
                                    x="9"
                                    y="25"
                                    fill="#727272"
                                    opacity=".1"
                                    rx="2"
                                />
                                <rect
                                    width="24"
                                    height="4"
                                    x="9"
                                    y="33"
                                    fill="#727272"
                                    opacity=".1"
                                    rx="2"
                                />
                                <path
                                    fill="url(#b)"
                                    d="M22 45c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14-14-6.268-14-14Z"
                                />
                                <path
                                    stroke="url(#c)"
                                    strokeOpacity=".15"
                                    strokeWidth="1.5"
                                    d="M36 31.75c7.318 0 13.25 5.932 13.25 13.25S43.318 58.25 36 58.25 22.75 52.318 22.75 45 28.682 31.75 36 31.75Z"
                                />
                                <path
                                    stroke="#FDFDFD"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="m31.834 42.833 2.752-2.752a2 2 0 0 1 2.829 0l2.752 2.752m-4.166-3V50.5"
                                />
                                <defs>
                                    <linearGradient
                                        id="a"
                                        x1="22"
                                        x2="22"
                                        y1="-13.364"
                                        y2="62.364"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#EBEBEB" />
                                        <stop offset="1" stopColor="#C4C4C4" />
                                    </linearGradient>
                                    <linearGradient
                                        id="b"
                                        x1="36"
                                        x2="36"
                                        y1="31"
                                        y2="59"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#779DFF" />
                                        <stop offset="1" stopColor="#2D68FF" />
                                    </linearGradient>
                                    <linearGradient
                                        id="c"
                                        x1="36"
                                        x2="36"
                                        y1="31"
                                        y2="59"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#E2E2E2" />
                                        <stop
                                            offset="1"
                                            stopColor="#E2E2E2"
                                            stopOpacity="0"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    )}
                </div>
                {error && (
                    <span className="text-red-500 text-sm ml-2 mt-2 block">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
}
