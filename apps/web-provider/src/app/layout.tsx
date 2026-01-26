import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "../components/providers/AppProviders";
import { GlobalSubscriptionWrapper } from "../components/GlobalSubscriptionWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
    title: {
        template: '%s | The Locals Partner',
        default: 'The Locals Partner - Grow Your Service Business',
    },
    description: "Join The Locals (Lokals) as a service provider. Connect with customers in your area for electrical, plumbing, cleaning, and more. Earn money on your terms with performance-based commissions.",
    keywords: ["locals", "lokals", "thelokals", "service provider", "home services", "technician jobs", "earn money", "local services", "plumber jobs", "electrician jobs"],
    openGraph: {
        title: 'The Locals Partner - Grow Your Service Business',
        description: 'Manage your service requests, track earnings, and update availability. Join the fastest growing local service network.',
        url: 'https://provider.thelokals.com', // Assuming URL, check if known
        siteName: 'The Locals',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'The Locals Partner - Grow Your Service Business',
        description: 'Join The Locals (Lokals) as a service provider and grow your business today.',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Lokals Pro',
    },
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/apple-icon.png',
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
