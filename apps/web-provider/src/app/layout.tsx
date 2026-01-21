import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "../components/providers/AppProviders";
import { GlobalSubscriptionWrapper } from "../components/GlobalSubscriptionWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
    title: {
        template: '%s | The Locals Provider',
        default: 'The Locals - Provider Portal',
    },
    description: "Manage your service requests, track earnings, and update availability.",
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Lokals Pro',
    },
};

export const viewport: Viewport = {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: true, // Accessibility fix: Allow zooming
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppProviders>
                    <GlobalSubscriptionWrapper>
                        {children}
                    </GlobalSubscriptionWrapper>
                </AppProviders>
            </body>
        </html>
    );
}
