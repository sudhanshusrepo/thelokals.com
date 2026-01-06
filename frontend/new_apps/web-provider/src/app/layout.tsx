import type { Metadata } from "next";
import { AppProviders } from "../components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
    title: "The Locals - Provider Portal",
    description: "Manage your requests, earnings, and availability.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AppProviders>
                    {children}
                </AppProviders>
            </body>
        </html>
    );
}
