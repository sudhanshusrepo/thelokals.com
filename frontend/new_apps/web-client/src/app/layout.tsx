import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { BookingProvider } from "../contexts/BookingContext";
import { BottomNav } from "../components/navigation/BottomNav";
import { Toaster } from "react-hot-toast";
import { AIChatWidget } from "../components/chat/AIChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        template: '%s | Lokals - Trusted Home Services',
        default: 'Lokals - Book Home Services Instantly',
    },
    description: 'Book trusted local professionals for AC repair, cleaning, appliance servcing, and more. Verified pros, upfront pricing, and satisfaction guaranteed.',
    keywords: ['home services', 'ac repair', 'cleaning', 'electrician', 'plumber', 'gurugram', 'ncr'],
    openGraph: {
        title: 'Lokals - Trusted Home Services',
        description: 'Book trusted local professionals instantly.',
        url: 'https://thelokals.com',
        siteName: 'Lokals',
        images: [
            {
                url: '/og-image.jpg', // Placeholder
                width: 1200,
                height: 630,
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Lokals - Trusted Home Services',
        description: 'Book trusted local professionals instantly.',
    },
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <BookingProvider>
                        <main className="pb-20">
                            {children}
                        </main>
                        <AIChatWidget />
                        <BottomNav />
                        <Toaster position="top-center" />
                    </BookingProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
