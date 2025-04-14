import type { Metadata } from "next";
import {
    Cormorant_Garamond,
    Geist,
    Geist_Mono,
    Italianno,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
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
    title: "Feno",
    description: "build your online presence in minutes",
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
        <html lang="en">
            <head>
                <meta
                    name="referrer"
                    content="strict-origin-when-cross-origin"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} ${italianno.variable} antialiased`}
            >
                <main className="w-full h-screen">{children}</main>
            </body>
        </html>
    );
}
