import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "The Lokals - Instant Home Services",
  description: "Book trusted professionals instantly in Mumbai, Delhi, and Bangalore.",
};

import { AuthProvider } from "../contexts/AuthContext";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { GoogleMapProvider } from "@thelocals/platform-core";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased bg-bg-primary text-text-primary min-h-screen flex flex-col">
        <AuthProvider>
          <GoogleMapProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-center" toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
              }
            }} />
          </GoogleMapProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
