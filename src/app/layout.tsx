import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "TQB Calculator - Softball Tie-Breaker",
    description: "Calculate softball tournament standings using WBSC Rule C11 tie-breaking criteria. Supports TQB, ER-TQB, and head-to-head calculations.",
    keywords: ["softball", "TQB", "tie-breaker", "WBSC", "tournament", "rankings"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
