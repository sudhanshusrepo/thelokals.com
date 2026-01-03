import type { Metadata } from "next";
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

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
            <body className="antialiased bg-neutral-50 text-neutral-900 font-sans">
                <AuthProvider>
                    {children}
                </AuthProvider>
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
