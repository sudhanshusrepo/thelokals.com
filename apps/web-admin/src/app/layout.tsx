import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
    title: "lokals Admin",
    description: "Admin dashboard for lokals platform",
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
