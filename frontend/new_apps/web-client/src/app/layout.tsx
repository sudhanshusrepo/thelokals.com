import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { BookingProvider } from "../contexts/BookingContext";
import { BottomNav } from "../components/navigation/BottomNav";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "lokals - Trusted Local Services",
    description: "Find trusted local professionals for cleaning, repairs, beauty, and more.",
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
                        <BottomNav />
                        <Toaster position="top-center" />
                    </BookingProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
