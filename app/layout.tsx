import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Italianno } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const interDisplay = localFont({
    src: [
        {
            path: "../public/fonts/InterDisplay-Light.woff2",
            weight: "300",
        },
        {
            path: "../public/fonts/InterDisplay-Regular.woff2",
            weight: "400",
        },
        {
            path: "../public/fonts/InterDisplay-Medium.woff2",
            weight: "500",
        },
        {
            path: "../public/fonts/InterDisplay-SemiBold.woff2",
            weight: "600",
        },
        {
            path: "../public/fonts/InterDisplay-Bold.woff2",
            weight: "700",
        },
    ],
    variable: "--font-inter-display",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const italianno = Italianno({
    variable: "--font-italianno",
    subsets: ["latin"],
    weight: "400",
});

const serif = Cormorant_Garamond({
    variable: "--font-serif",
    subsets: ["latin"],
    weight: "400",
});

export const metadata: Metadata = {
    title: "Feno — Your Story, Beautifully Told",
    description:
        "Transform your resume into a stunning digital portfolio in minutes. Share your professional journey with style and impact.",
    other: {
        "Content-Security-Policy":
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <head>
                <meta
                    name="referrer"
                    content="strict-origin-when-cross-origin"
                />
            </head>
            <body
                className={`${interDisplay.variable} ${geistMono.variable} ${serif.variable} ${italianno.variable} antialiased`}
            >
                <main className="w-full h-screen">{children}</main>
            </body>
        </html>
    );
}
